# Chatbot Web App

Flexible chatbot web application that can be configured for different topics.

## Features

- **Configurable Topics**: Games, Religion, Education, or Custom
- **PWA Support**: Installable on mobile devices
- **Voice Input**: Web Speech API (Chrome Android)
- **Bug Reports**: With screenshot capture
- **Chat History**: Stored in localStorage
- **Responsive Design**: Works on all devices

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
BOT_NAME=دانا
TOPIC=games
TOPIC_TITLE=چت‌بات ارتقاء بازی
SIDEBAR_ITEMS=[{"icon":"🐍","name":"مار نئون","url":"/game-platform/"}]
```

## API Endpoints

- `GET /health` - Health check
- `GET /config` - Get configuration
- `POST /chat` - Send message (returns jobId)
- `GET /status/:jobId` - Poll for response

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

## Topic Examples

### Games
```env
TOPIC=games
SIDEBAR_ITEMS=[{"icon":"🐍","name":"مار نئون","url":"/game-platform/"}]
```

### Religion
```env
TOPIC=religion
SIDEBAR_ITEMS=[{"icon":"📖","name":"احکام","url":"/rules/"},{"icon":"🕌","name":"نماز","url":"/prayer/"}]
```

### Education
```env
TOPIC=education
SIDEBAR_ITEMS=[{"icon":"📚","name":"ریاضی","url":"/math/"},{"icon":"🔬","name":"علوم","url":"/science/"}]
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