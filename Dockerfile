FROM node:20-slim

# Install system deps + Claude Code CLI
RUN apt-get update && apt-get install -y curl git && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anthropic-ai/claude-code netlify-cli

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm install --production

# Copy project files
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
