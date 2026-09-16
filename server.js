require('dotenv').config();
const http = require('http');
const { randomBytes } = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3458;
const BOT_NAME = process.env.BOT_NAME || 'دانا';
const TOPIC = process.env.TOPIC || 'games';
const TOPIC_TITLE = process.env.TOPIC_TITLE || 'چت‌بات';
const TOPIC_ICON = process.env.TOPIC_ICON || '🎮';
const SIDEBAR_ITEMS = JSON.parse(process.env.SIDEBAR_ITEMS || '[]');
const QUICK_ACTIONS = JSON.parse(process.env.QUICK_ACTIONS || '[]');

const GAMES_FILE = path.join(__dirname, 'games.json');

const jobs = new Map();

function createJob(data) {
  const id = randomBytes(8).toString('hex');
  jobs.set(id, { id, message: data.message, status: 'queued', response: null, created: Date.now() });
  return id;
}

function processJob(job) {
  job.status = 'processing';
  
  setTimeout(() => {
    const msg = job.message.toLowerCase();
    let response = '';
    
    if (msg.includes('سلام') || msg.includes('حال')) {
      response = `سلام! خوبم ممنون. ${BOT_NAME} در خدمتم. چه کمکی می‌خوای؟`;
    } else if (msg.includes('جدید') || msg.includes('بساز')) {
      response = `چه چیز جدیدی می‌خوای؟ توضیح بده تا بسازمش.`;
    } else if (msg.includes('خطا') || msg.includes('باگ')) {
      response = 'گزارش خطا ثبت شد. در اسرع وقت رفع می‌کنم.';
    } else {
      response = `درخواستت دریافت شد: "${job.message.slice(0, 50)}..."\n\nدارم روش کار می‌کنم!`;
    }
    
    job.status = 'done';
    job.response = response;
  }, 1500);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'GET' && req.url === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      botName: BOT_NAME, 
      topic: TOPIC,
      topicTitle: TOPIC_TITLE,
      topicIcon: TOPIC_ICON,
      sidebarItems: SIDEBAR_ITEMS,
      quickActions: QUICK_ACTIONS
    }));
    return;
  }

  if (req.method === 'GET' && req.url === '/games.json') {
    if (fs.existsSync(GAMES_FILE)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      fs.createReadStream(GAMES_FILE).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.message) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Message required' })); return; }
        const jobId = createJob(data);
        processJob(jobs.get(jobId));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jobId, status: 'queued' }));
      } catch (e) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
    });
    return;
  }

  const statusMatch = req.url.match(/^\/status\/([a-f0-9]+)$/);
  if (req.method === 'GET' && statusMatch) {
    const job = jobs.get(statusMatch[1]);
    if (!job) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Not found' })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: job.id, status: job.status, response: job.response }));
    return;
  }

  // Static files
  if (req.method === 'GET') {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) { if (now - job.created > 300000) jobs.delete(id); }
}, 300000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${TOPIC}] ${BOT_NAME} running on port ${PORT}`);
});