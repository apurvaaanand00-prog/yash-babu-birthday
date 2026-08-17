const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.YASH_PASSWORD || 'YashBabu13';
const ROOT = path.join(__dirname, 'public');
const sessions = new Map();

function token() { return crypto.randomBytes(32).toString('hex'); }
function cookieValue(req, name) {
  const raw = req.headers.cookie || '';
  const part = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : null;
}
function isAuthed(req) { const t = cookieValue(req, 'yash_session'); return t && sessions.has(t); }
function send(res, status, type, body, headers={}) {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store', ...headers});
  res.end(body);
}
function pageLogin(res, bad=false) {
  const msg = bad ? '<p class="error">Wrong password. Try again.</p>' : '';
  send(res, 200, 'text/html; charset=utf-8', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yash Babu — Private Birthday Portal</title><link rel="stylesheet" href="/styles.css"></head><body class="locked"><main class="lock-card"><div class="pixel-orb">14</div><div class="eyebrow">PRIVATE FAMILY PORTAL</div><h1>YASH BABU</h1><p class="lock-sub">Level 14 is waiting. Enter the family password to begin.</p><form method="post" action="/login"><input name="password" type="password" placeholder="Family password" autocomplete="current-password" required><button>UNLOCK THE MISSION ✦</button></form>${msg}<p class="tiny">This site is intended for Yash and family only.</p></main></body></html>`);
}
function parseBody(req) { return new Promise(resolve => { let b=''; req.on('data',c=>b+=c); req.on('end',()=>resolve(new URLSearchParams(b))); }); }

const server = http.createServer(async (req,res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/') { return isAuthed(req) ? serveFile(res, '/index.html') : pageLogin(res); }
  if (req.method === 'POST' && url.pathname === '/login') {
    const body = await parseBody(req);
    if (body.get('password') === PASSWORD) {
      const t = token(); sessions.set(t, Date.now());
      return send(res, 303, 'text/plain', '', {'Location':'/', 'Set-Cookie':`yash_session=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`});
    }
    return pageLogin(res, true);
  }
  if (req.method === 'POST' && url.pathname === '/logout') {
    const t=cookieValue(req,'yash_session'); if(t) sessions.delete(t);
    return send(res,303,'text/plain','',{'Location':'/','Set-Cookie':'yash_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
  }
  if (!isAuthed(req)) return send(res, 403, 'text/plain; charset=utf-8', 'Private family portal. Please unlock first.');
  if (url.pathname.startsWith('/photos/')) {
    const rel = decodeURIComponent(url.pathname).replace(/^\//,'');
    if (rel.includes('..')) return send(res,400,'text/plain','Bad request');
  }
  return serveFile(res, url.pathname);
});

function serveFile(res, pathname) {
  const clean = pathname === '/' ? '/index.html' : pathname;
  const file = path.join(ROOT, clean.replace(/^\//,''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res,404,'text/plain','Not found');
  const ext = path.extname(file).toLowerCase();
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
  res.writeHead(200, {'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'private, max-age=3600'});
  fs.createReadStream(file).pipe(res);
}

server.listen(PORT, ()=>console.log(`Yash Babu birthday portal running at http://localhost:${PORT}`));
