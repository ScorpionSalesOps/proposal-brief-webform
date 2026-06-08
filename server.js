const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/submit', async (req, res) => {
  const { clientName, domain, industry, location, competitors, repName, bookingLink, discoveryNotes } = req.body;

  if (!clientName || !domain) {
    return res.status(400).json({ error: 'Client name and domain are required.' });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl) {
    const fields = [
      { label: 'Domain', value: domain },
      industry      && { label: 'Industry',      value: industry },
      location      && { label: 'Location',      value: location },
      competitors   && { label: 'Competitors',   value: competitors },
      repName       && { label: 'Rep',           value: repName },
      bookingLink   && { label: 'Booking Link',  value: bookingLink },
    ].filter(Boolean);

    const fieldText = fields.map(f => `*${f.label}:* ${f.value}`).join('\n');
    const notesBlock = discoveryNotes ? `\n\n*Discovery Notes:*\n${discoveryNotes}` : '';

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

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Proposal brief webform running on http://localhost:${PORT}`);
});
