const express = require('express');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_DIR = __dirname;
const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

// job state: { status, logs, briefPath, clientName, netlifyUrl }
const jobs = new Map();

// Derive a stable Netlify site name from client name
function toSiteSlug(clientName) {
  return 'scorpion-brief-' + clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Find existing Netlify site by name, or create one. Returns site UUID.
async function findOrCreateNetlifySite(siteName) {
  const headers = {
    Authorization: `Bearer ${NETLIFY_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Search for existing site
  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites?name=${encodeURIComponent(siteName)}&filter=all`,
    { headers }
  );
  const sites = await searchRes.json();
  const existing = Array.isArray(sites) && sites.find(s => s.name === siteName);
  if (existing) return existing.id;

  // Create new site
  const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: siteName }),
  });
  const created = await createRes.json();
  if (!created.id) throw new Error(`Netlify site creation failed: ${JSON.stringify(created)}`);
  return created.id;
}

// Post form submission to Slack so the team can action it
async function notifySlackSubmission({ clientName, domain, industry, location, competitors, repName, bookingLink, discoveryNotes }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const fields = [
    { label: 'Domain', value: domain },
    industry && { label: 'Industry', value: industry },
    location && { label: 'Location', value: location },
    competitors && { label: 'Competitors', value: competitors },
    repName && { label: 'Rep', value: repName },
    bookingLink && { label: 'Booking Link', value: bookingLink },
  ].filter(Boolean);

  const fieldText = fields.map(f => `*${f.label}:* ${f.value}`).join('\n');
  const notesBlock = discoveryNotes
    ? `\n\n*Discovery Notes:*\n${discoveryNotes}`
    : '';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:rocket: *Brief request: ${clientName}*\n${fieldText}${notesBlock}`,
          },
        },
      ],
    }),
  });
}

// Deploy brief folder to Netlify site UUID using CLI
function deployToNetlify(briefDir, siteId) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'netlify',
      ['deploy', '--dir', briefDir, '--site', siteId, '--prod', '--json'],
      {
        cwd: PROJECT_DIR,
        env: { ...process.env, NETLIFY_AUTH_TOKEN: NETLIFY_TOKEN },
      }
    );

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => (stdout += d.toString()));
    proc.stderr.on('data', d => (stderr += d.toString()));

    proc.on('close', code => {
      if (code !== 0) return reject(new Error(stderr || `netlify deploy exited ${code}`));
      try {
        const result = JSON.parse(stdout);
        resolve(result.deploy_url || result.url);
      } catch {
        // netlify CLI output isn't always clean JSON — fall back to parsing URL
        const match = stdout.match(/https:\/\/[^\s]+\.netlify\.app/);
        resolve(match ? match[0] : null);
      }
    });
  });
}

app.use(express.json());
app.use(express.static(path.join(PROJECT_DIR, 'public')));

// Serve generated brief HTML files
app.get('/brief/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).send('Brief not found.');
  if (!job.briefPath) return res.status(202).send('Brief is still generating.');

  const fullPath = path.join(PROJECT_DIR, job.briefPath);
  if (!fs.existsSync(fullPath)) return res.status(404).send('Brief file missing.');
  res.sendFile(fullPath);
});

// Serve brief assets (screenshots, logo, etc.)
app.use('/brief-assets', express.static(PROJECT_DIR));

// Submit form → start claude job
app.post('/submit', (req, res) => {
  const { clientName, domain, industry, location, competitors, repName, bookingLink, discoveryNotes } = req.body;

  if (!clientName || !domain) {
    return res.status(400).json({ error: 'Client name and domain are required.' });
  }

  const jobId = randomUUID();

  // Build structured metadata for the final arg so auto-brief can use each piece
  const meta = [];
  if (repName) meta.push(`Rep: ${repName}`);
  if (bookingLink) meta.push(`Booking link: ${bookingLink}`);
  if (discoveryNotes) meta.push(discoveryNotes);

  const args = [
    clientName,
    domain,
    '',                          // contract URL slot — unused from form
    industry || '',
    location || '',
    competitors || 'auto',
    meta.join('. '),
  ].join('|');

  jobs.set(jobId, { status: 'running', logs: [], briefPath: null, clientName });

  // Notify Slack immediately on submission so team can track requests
  notifySlackSubmission({ clientName, domain, industry, location, competitors, repName, bookingLink, discoveryNotes }).catch(() => {});

  // Kick off claude non-interactively
  const claude = spawn('claude', ['--print', '--no-ansi', `/auto-brief ${args}`], {
    cwd: PROJECT_DIR,
    env: {
      ...process.env,
      // Ensure npm/npx are available for MCP servers
      PATH: process.env.PATH,
    },
  });

  const job = jobs.get(jobId);

  claude.stdout.on('data', (data) => {
    const text = data.toString();
    job.logs.push({ type: 'stdout', text });

    // Detect JSON completion output from auto-brief
    try {
      const jsonMatch = text.match(/\{[\s\S]*"status"[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.status === 'success' && result.brief_path) {
          job.briefPath = result.brief_path;
          job.status = 'done';
        } else if (result.status === 'error') {
          job.status = 'error';
          job.error = result.error;
        }
      }
    } catch (_) {}
  });

  claude.stderr.on('data', (data) => {
    job.logs.push({ type: 'stderr', text: data.toString() });
  });

  claude.on('close', async (code) => {
    if (job.status === 'running') {
      job.status = code === 0 ? 'done' : 'error';
    }
    job.logs.push({ type: 'system', text: `Process exited with code ${code}` });

    // Deploy to Netlify if brief was generated and token is configured
    if (job.briefPath && NETLIFY_TOKEN) {
      const briefDir = path.join(PROJECT_DIR, path.dirname(job.briefPath));
      const siteName = toSiteSlug(clientName);
      job.logs.push({ type: 'system', text: `Deploying to Netlify (${siteName})…` });
      try {
        const siteId = await findOrCreateNetlifySite(siteName);
        const netlifyUrl = await deployToNetlify(briefDir, siteId);
        job.netlifyUrl = netlifyUrl;
        job.logs.push({ type: 'system', text: `Deployed: ${netlifyUrl}` });
      } catch (err) {
        job.logs.push({ type: 'stderr', text: `Netlify deploy failed: ${err.message}` });
      }
      // Signal done after deploy attempt (success or not)
      job.status = 'done';
    }
  });

  res.json({ jobId });
});

// SSE stream of job logs
app.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let sentIndex = 0;

  const send = () => {
    while (sentIndex < job.logs.length) {
      const entry = job.logs[sentIndex++];
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    }

    if (job.status === 'done') {
      res.write(`data: ${JSON.stringify({ type: 'done', briefPath: job.briefPath, netlifyUrl: job.netlifyUrl || null })}\n\n`);
      res.end();
      return;
    }
    if (job.status === 'error') {
      res.write(`data: ${JSON.stringify({ type: 'error', error: job.error || 'Brief generation failed.' })}\n\n`);
      res.end();
      return;
    }
  };

  send();
  const interval = setInterval(() => {
    send();
    if (job.status !== 'running') clearInterval(interval);
  }, 500);

  req.on('close', () => clearInterval(interval));
});

app.listen(PORT, () => {
  console.log(`Proposal brief webform running on http://localhost:${PORT}`);
});
