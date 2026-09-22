# Chatbot Web App

Flexible chatbot web application that can be configured for different topics.

## Features

- **Configurable Topics**: Games, Religion, Education, or Custom
- **PWA Support**: Installable on mobile devices (manifest.json + service worker)
- **Voice Input**: Web Speech API (Chrome Android)
- **Bug Reports**: With screenshot capture
- **Chat History**: Stored in localStorage
- **Responsive Design**: Works on all devices
- **Job-based Chat API**: Async message processing with job polling

## Quick Start

```bash
# Install dependencies
make install

# Start server
make start

# Run tests
make test

# View logs
make logs
```

## Configuration

Edit `.env` to customize:

```env
PORT=3458
BOT_NAME=Dana
TOPIC=games
TOPIC_TITLE=Game Upgradation Chatbot
TOPIC_ICON=🎮
SIDEBAR_ITEMS=[{"icon":"🐍","name":"Snake Neon","url":"/game-platform/"}]
QUICK_ACTIONS=["+ Power Up","+ Sound","+ New Theme","Bug Report","📱 Mobile"]
```

## API Endpoints

- `GET /health` - Health check
- `GET /config` - Get configuration
- `POST /chat` - Send message (returns jobId)
- `GET /status/:jobId` - Poll for response
- `GET /games.json` - Get games list (from `games.json` file, returns `[]` if missing)

## Deployment

### To adlr.ir/apps/chatbot/

1. Update nginx config:
```nginx
location /apps/chatbot/ {
    rewrite ^/apps/chatbot/(.*) /$1 break;
    proxy_pass http://172.26.0.100:3458;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
}
```

2. Deploy files:
```bash
make deploy
```

3. Install and start:
```bash
ssh root@185.18.215.60
cd /root/nginx-certbot/websites/chatbot
make install
make start
```

## Project Structure

- `server.js` - Node.js HTTP server with chat API endpoints
- `index.html` - Single-file frontend (HTML/CSS/JS)
- `manifest.json` - PWA manifest for mobile installation
- `sw.js` - Service worker for offline support
- `games.json` - Optional games list for dynamic sidebar items
- `.env` / `.env.example` - Server and bot configuration

## Topic Examples

### Games
```env
TOPIC=games
SIDEBAR_ITEMS=[{"icon":"🐍","name":"Snake Neon","url":"/game-platform/"}]
```

### Religion
```env
TOPIC=religion
SIDEBAR_ITEMS=[{"icon":"📖","name":"Ahkam","url":"/rules/"},{"icon":"🕌","name":"Prayer","url":"/prayer/"}]
```

### Education
```env
TOPIC=education
SIDEBAR_ITEMS=[{"icon":"📚","name":"Math","url":"/math/"},{"icon":"🔬","name":"Science","url":"/science/"}]
```

## Git Workflow

```bash
# Clone
git clone /opt/webapp.git

# Make changes
git add -A
git commit -m "Description"

# Push
git push origin main
```

## License

hamidshariati.ir © 2026