// Lokalny panel CRM — zero zależności, tylko Node >= 18.
// Uruchomienie: npm run crm  ->  http://localhost:4000
// Zapisuje do docs/data/exercises.json oraz docs/gifs/ (to jest "baza" w gicie).

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const DB_FILE = path.join(DOCS, 'data', 'exercises.json');
const TAGS_FILE = path.join(DOCS, 'data', 'tags.json');
const GIF_DIR = path.join(DOCS, 'gifs');
const CRM_DIR = __dirname;
const HOST = '127.0.0.1'; // tylko lokalnie
const MAX_GIF_BYTES = 15 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

// ---------- baza ----------
async function readDb() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return { version: 1, exercises: [] };
    throw e;
  }
}

async function writeDb(db) {
  // zapis atomowy + stabilny format (czytelne diffy w gicie)
  const tmp = DB_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(db, null, 2) + '\n');
  await fs.rename(tmp, DB_FILE);
}

// ---------- słownik tagów (tłumaczenie EN + kolor) ----------
const PALETTE_SIZE = 13; // musi zgadzać się z --tag-0..12 w docs/css/style.css

async function readTags() {
  try {
    return JSON.parse(await fs.readFile(TAGS_FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return { version: 1, tags: {} };
    throw e;
  }
}

async function writeTags(t) {
  const tmp = TAGS_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(t, null, 2) + '\n');
  await fs.rename(tmp, TAGS_FILE);
}

// każdy nowy tag dostaje najmniejszy jeszcze nieużyty kolor (potem cyklicznie)
async function syncTags(tagList) {
  const db = await readTags();
  let changed = false;
  for (const tag of tagList) {
    if (db.tags[tag]) continue;
    // najrzadziej używany kolor (przy wolnych kolorach: najmniejszy nieużyty)
    const counts = Array(PALETTE_SIZE).fill(0);
    for (const x of Object.values(db.tags)) if (Number.isInteger(x.color)) counts[x.color % PALETTE_SIZE]++;
    const color = counts.indexOf(Math.min(...counts));
    db.tags[tag] = { en: '', color };
    changed = true;
  }
  if (changed) await writeTags(db);
}

function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/ł/g, 'l')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cwiczenie'
  );
}

function uniqueId(base, existing) {
  let id = base;
  for (let i = 2; existing.has(id); i++) id = `${base}-${i}`;
  return id;
}

function cleanTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags || '').split(',');
  return [...new Set(list.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];
}

function validate(body) {
  const name = String(body.name || '').trim();
  if (!name) return { error: 'Nazwa jest wymagana' };
  return {
    value: {
      name: name.slice(0, 120),
      description: String(body.description || '').trim().slice(0, 5000),
      nameEn: String(body.nameEn || '').trim().slice(0, 120),
      descriptionEn: String(body.descriptionEn || '').trim().slice(0, 5000),
      tags: cleanTags(body.tags).slice(0, 30),
    },
  };
}

const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------- http helpers ----------
function send(res, status, data, headers = {}) {
  const isBuf = Buffer.isBuffer(data);
  res.writeHead(status, {
    'Content-Type': isBuf ? 'application/octet-stream' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isBuf ? data : JSON.stringify(data));
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error('Plik za duży'), { status: 413 });
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

async function readJson(req) {
  const buf = await readBody(req, 1024 * 1024);
  try {
    return JSON.parse(buf.toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Niepoprawny JSON'), { status: 400 });
  }
}

async function serveFile(res, baseDir, rel) {
  const full = path.resolve(baseDir, '.' + path.sep + rel);
  if (full !== baseDir && !full.startsWith(baseDir + path.sep)) return send(res, 403, { error: 'Zabronione' });
  try {
    const data = await fs.readFile(full);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(full)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    send(res, 404, { error: 'Nie znaleziono' });
  }
}

async function removeGif(name) {
  if (!name || path.basename(name) !== name) return;
  await fs.rm(path.join(GIF_DIR, name), { force: true });
}

// ---------- API ----------
async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api','exercises',id?,'gif'?]
  const [, resource, id, sub] = parts;
  if (resource === 'tags' && !id) {
    if (req.method === 'GET') return send(res, 200, await readTags());
    if (req.method === 'PUT') {
      // body: { en: { "<tag>": "tłumaczenie", ... } } — zmienia tylko tłumaczenia
      const body = await readJson(req);
      const db = await readTags();
      for (const [tag, en] of Object.entries(body.en || {})) {
        if (db.tags[tag]) db.tags[tag].en = String(en).trim().toLowerCase().slice(0, 60);
      }
      await writeTags(db);
      return send(res, 200, db);
    }
    return send(res, 405, { error: 'Metoda niedozwolona' });
  }
  if (resource !== 'exercises') return send(res, 404, { error: 'Nie znaleziono' });
  if (id && !SAFE_ID.test(id)) return send(res, 400, { error: 'Niepoprawne id' });

  const db = await readDb();
  const find = () => db.exercises.findIndex((e) => e.id === id);

  if (!id) {
    if (req.method === 'GET') return send(res, 200, db);
    if (req.method === 'POST') {
      const { value, error } = validate(await readJson(req));
      if (error) return send(res, 400, { error });
      const now = new Date().toISOString();
      const ids = new Set(db.exercises.map((e) => e.id));
      const ex = { id: uniqueId(slugify(value.name), ids), ...value, gif: null, createdAt: now, updatedAt: now };
      db.exercises.push(ex);
      await writeDb(db);
      await syncTags(ex.tags);
      return send(res, 201, ex);
    }
  } else if (!sub) {
    const i = find();
    if (i < 0) return send(res, 404, { error: 'Nie znaleziono ćwiczenia' });
    if (req.method === 'GET') return send(res, 200, db.exercises[i]);
    if (req.method === 'PUT') {
      const { value, error } = validate(await readJson(req));
      if (error) return send(res, 400, { error });
      db.exercises[i] = { ...db.exercises[i], ...value, updatedAt: new Date().toISOString() };
      await writeDb(db);
      await syncTags(value.tags);
      return send(res, 200, db.exercises[i]);
    }
    if (req.method === 'DELETE') {
      const [removed] = db.exercises.splice(i, 1);
      await writeDb(db);
      await removeGif(removed.gif);
      return send(res, 200, { ok: true });
    }
  } else if (sub === 'gif') {
    const i = find();
    if (i < 0) return send(res, 404, { error: 'Nie znaleziono ćwiczenia' });
    if (req.method === 'PUT') {
      const buf = await readBody(req, MAX_GIF_BYTES);
      if (buf.length < 6 || buf.subarray(0, 4).toString('latin1') !== 'GIF8')
        return send(res, 400, { error: 'To nie jest plik GIF' });
      const old = db.exercises[i].gif;
      const file = `${id}-${Date.now()}.gif`; // nowa nazwa = brak problemów z cache
      await fs.writeFile(path.join(GIF_DIR, file), buf);
      db.exercises[i].gif = file;
      db.exercises[i].updatedAt = new Date().toISOString();
      await writeDb(db);
      if (old) await removeGif(old);
      return send(res, 200, db.exercises[i]);
    }
    if (req.method === 'DELETE') {
      await removeGif(db.exercises[i].gif);
      db.exercises[i].gif = null;
      db.exercises[i].updatedAt = new Date().toISOString();
      await writeDb(db);
      return send(res, 200, db.exercises[i]);
    }
  }
  send(res, 405, { error: 'Metoda niedozwolona' });
}

// ---------- serwer ----------
const siteOnly = process.argv.includes('--site-only');
// CRM: 4000, podgląd strony: 4001 (mogą działać równocześnie); nadpisz zmienną PORT
const PORT = Number(process.env.PORT) || (siteOnly ? 4001 : 4000);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}`);
    const p = decodeURIComponent(url.pathname);

    if (!siteOnly && p.startsWith('/api/')) return await api(req, res, url);

    if (siteOnly) {
      // podgląd publicznej strony: http://localhost:4000
      return serveFile(res, DOCS, p === '/' ? 'index.html' : p);
    }
    // panel CRM: własne pliki + współdzielone zasoby ze strony
    if (p === '/') return serveFile(res, CRM_DIR, 'index.html');
    if (/^\/(css|gifs|data)\//.test(p)) return serveFile(res, DOCS, p);
    return serveFile(res, CRM_DIR, p);
  } catch (e) {
    console.error(e);
    send(res, e.status || 500, { error: e.message || 'Błąd serwera' });
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} jest zajęty (pewnie już działa serwer). Zamknij go (Ctrl+C) albo użyj innego portu: PORT=${PORT + 10} npm run ${siteOnly ? 'site' : 'crm'}`);
  } else console.error(e);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`${siteOnly ? 'Podgląd strony' : 'CRM'}: http://localhost:${PORT}`);
});
