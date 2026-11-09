// Publiczna strona (PL / EN) — czyta data/exercises.json i data/tags.json, wszystko w przeglądarce.
// Języki nie mieszają się: cały interfejs i treści są w jednym wybranym języku.

const I18N = {
  pl: {
    htmlLang: 'pl',
    title: 'Baza ćwiczeń z opisami',
    metaDesc: 'Katalog ćwiczeń z filtrowaniem i sortowaniem.',
    search: 'Szukaj ćwiczenia…',
    searchAria: 'Szukaj',
    sortAria: 'Sortowanie',
    tagsAria: 'Filtr tagów',
    filterTags: 'Filtruj tagi',
    clearTags: 'wyczyść',
    sort: { 'name-asc': 'Nazwa A–Z', 'name-desc': 'Nazwa Z–A', new: 'Najnowsze', old: 'Najstarsze' },
    noGif: 'brak GIF-a',
    empty: 'Brak ćwiczeń spełniających kryteria.',
    loadError: 'Nie udało się wczytać danych.',
    count: (n, total) => `Wyświetlono ${n} z ${total}`,
    clear: 'wyczyść filtry',
    disclaimer:
      'Baza ćwiczeń ma charakter wyłącznie informacyjny i edukacyjny. Przed rozpoczęciem treningu upewnij się, że nie masz przeciwwskazań zdrowotnych. Wszystkie ćwiczenia wykonujesz na własną odpowiedzialność. Obciążenie należy dobrać indywidualnie do możliwości i stażu treningowego.',
    copyright: 'matiwan © 2026',
    links: { youtube: 'youtube', shop: 'sklep' },
  },
  en: {
    htmlLang: 'en',
    title: 'Exercise Database with Descriptions',
    metaDesc: 'Exercise catalog with filtering and sorting.',
    search: 'Search exercises…',
    searchAria: 'Search',
    sortAria: 'Sort',
    tagsAria: 'Tag filter',
    filterTags: 'Filter tags',
    clearTags: 'clear',
    sort: { 'name-asc': 'Name A–Z', 'name-desc': 'Name Z–A', new: 'Newest', old: 'Oldest' },
    noGif: 'no GIF',
    empty: 'No exercises match your criteria.',
    loadError: 'Failed to load data.',
    count: (n, total) => `Showing ${n} of ${total}`,
    clear: 'clear filters',
    disclaimer:
      'The exercise database is for informational and educational purposes only. Before you start training, make sure you have no health contraindications. You perform all exercises at your own risk. Choose the load individually according to your abilities and training experience.',
    copyright: 'matiwan © 2026',
    links: { youtube: 'youtube', shop: 'shop' },
  },
};

// Linki w stopce (etykiety są w I18N.links). Pusty adres = link się nie wyświetla.
const LINKS = [
  { key: 'youtube', url: 'https://www.youtube.com/@matiwann' },
  { key: 'shop', url: 'https://www.naffy.io/matiwan' },
];

const $ = (id) => document.getElementById(id);
const state = { all: [], release: '', tagDb: {}, q: '', tags: new Set(), sort: 'name-asc', lang: 'pl' };
const t = () => I18N[state.lang];

// ---------- język ----------
function detectLang() {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl in I18N) return fromUrl;
    const saved = localStorage.getItem('lang');
    if (saved in I18N) return saved;
  } catch {}
  return 'pl';
}

function setLang(lang) {
  state.lang = lang;
  try {
    localStorage.setItem('lang', lang);
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  } catch {}
  applyLang();
}

// treść w wybranym języku (z awaryjnym powrotem do polskiego, gdy brak tłumaczenia)
const exName = (e) => (state.lang === 'en' && e.nameEn) || e.name;
const exDesc = (e) => (state.lang === 'en' && e.descriptionEn) || e.description;
const tagLabel = (tag) => (state.lang === 'en' && state.tagDb[tag] && state.tagDb[tag].en) || tag;

function tagColor(tag) {
  const c = state.tagDb[tag] && state.tagDb[tag].color;
  if (Number.isInteger(c)) return String(c);
  let h = 0; // awaryjnie, gdy tag nie ma wpisu w tags.json
  for (const ch of tag) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String(h % 13);
}

// ---------- DOM ----------
function el(tag, props = {}, ...children) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...children);
  return n;
}

function renderBanner() {
  const h1 = $('banner');
  if (state.lang === 'pl') {
    h1.className = '';
    h1.replaceChildren(el('img', { src: 'img/page_header.png', alt: t().title }));
  } else {
    // grafika nagłówka jest po polsku — wersja EN używa tekstu w tym samym stylu
    h1.className = 'text';
    h1.replaceChildren('Exercise Database', el('span', { className: 'line2', textContent: 'with descriptions' }));
  }
}

function renderFooter() {
  $('disclaimer').textContent = t().disclaimer;
  const parts = [document.createTextNode(t().copyright)];
  for (const l of LINKS.filter((l) => l.url)) {
    parts.push(document.createTextNode(' | '), el('a', { href: l.url, textContent: t().links[l.key], target: '_blank', rel: 'noopener noreferrer' }));
  }
  if (state.release) parts.push(document.createTextNode(' | '), el('span', { className: 'release', textContent: `v${state.release}` }));
  $('footerLinks').replaceChildren(...parts);
}

function applyLang() {
  const L = t();
  document.documentElement.lang = L.htmlLang;
  document.title = L.title;
  $('metaDesc').setAttribute('content', L.metaDesc);
  $('lang').checked = state.lang === 'en';
  document.querySelectorAll('.lang-label').forEach((n) => n.classList.toggle('on', n.dataset.for === state.lang));
  $('q').placeholder = L.search;
  $('q').setAttribute('aria-label', L.searchAria);
  $('sort').setAttribute('aria-label', L.sortAria);
  $('tagfilter').setAttribute('aria-label', L.tagsAria);
  $('tagClear').textContent = L.clearTags;
  tagListKey = ''; // przebuduj listę tagów w nowym języku
  for (const o of $('sort').options) o.textContent = L.sort[o.value];
  renderBanner();
  renderFooter();
  render();
}

// ---------- lista ----------
const SORTERS = {
  'name-asc': (a, b) => exName(a).localeCompare(exName(b), state.lang),
  'name-desc': (a, b) => exName(b).localeCompare(exName(a), state.lang),
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
  old: (a, b) => a.createdAt.localeCompare(b.createdAt),
};

function tagBtn(tag, onclick) {
  const b = el('button', { className: 'tag' + (state.tags.has(tag) ? ' active' : ''), type: 'button', textContent: tagLabel(tag), onclick });
  b.dataset.c = tagColor(tag);
  return b;
}

function toggleTag(tag) {
  state.tags.has(tag) ? state.tags.delete(tag) : state.tags.add(tag);
  render();
}

function visible() {
  const q = state.q.trim().toLowerCase();
  return state.all
    .filter((e) => !q || `${exName(e)} ${exDesc(e)} ${e.tags.map(tagLabel).join(' ')}`.toLowerCase().includes(q))
    .filter((e) => [...state.tags].every((tag) => e.tags.includes(tag))) // AND; filtry trzymają kanoniczne (PL) id tagów
    .sort(SORTERS[state.sort]);
}

// przewiń do karty i podświetl ją na chwilę
function highlight(node) {
  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  node.classList.remove('highlight');
  void node.offsetWidth; // restart animacji
  node.classList.add('highlight');
  setTimeout(() => node.classList.remove('highlight'), 3000);
}

function card(e) {
  const media = el('div', { className: 'media' });
  if (e.gif) media.append(el('img', { src: `gifs/${e.gif}`, alt: exName(e), loading: 'lazy' }));
  else media.textContent = t().noGif;

  const tags = el('div', { className: 'tags' });
  for (const tag of e.tags) tags.append(tagBtn(tag, () => toggleTag(tag)));
  // nazwa ćwiczenia jest stałym linkiem (#id); kliknięcie wpisuje go w pasek adresu
  const title = el('a', { href: `#${e.id}`, textContent: exName(e) });
  const article = el('article', { className: 'card' }, media, el('div', { className: 'body' }, el('h3', {}, title), el('p', { textContent: exDesc(e) }), tags));
  article.dataset.id = e.id;
  title.onclick = (ev) => {
    ev.preventDefault();
    const url = new URL(location.href);
    url.hash = e.id;
    history.replaceState(null, '', url); // bez przeładowania i bez zdejmowania filtrów
    highlight(article);
  };
  return article;
}

// lista tagów z checkboxami (rozwijany box „Filtruj tagi”)
let tagListKey = '';

function buildTagList(all) {
  $('tagList').replaceChildren(
    ...all.map((tag) => {
      const box = el('input', { type: 'checkbox', checked: state.tags.has(tag) });
      box.dataset.tag = tag;
      box.onchange = () => toggleTag(tag);
      const pill = el('span', { className: 'tag static', textContent: tagLabel(tag) });
      pill.dataset.c = tagColor(tag);
      return el('label', { className: 'tagfilter-item' }, box, pill);
    })
  );
}

function syncTagList() {
  for (const box of $('tagList').querySelectorAll('input')) box.checked = state.tags.has(box.dataset.tag);
  $('tagfilterLabel').textContent = t().filterTags + (state.tags.size ? ` (${state.tags.size})` : '');
  $('tagfilter').classList.toggle('has-selection', state.tags.size > 0);
}

function render() {
  const all = [...new Set(state.all.flatMap((e) => e.tags))].sort((a, b) => tagLabel(a).localeCompare(tagLabel(b), state.lang));
  const key = state.lang + '|' + all.join('|');
  if (key !== tagListKey) {
    tagListKey = key;
    buildTagList(all); // przebudowa tylko przy zmianie języka/danych — checkbox zachowuje fokus
  }
  syncTagList();

  const list = visible();
  $('meta').replaceChildren(el('span', { textContent: t().count(list.length, state.all.length) }));
  if (state.q || state.tags.size) {
    $('meta').append(el('button', { type: 'button', textContent: t().clear, onclick: () => { state.q = ''; state.tags.clear(); $('q').value = ''; render(); } }));
  }
  $('grid').replaceChildren(...(list.length ? list.map(card) : [el('div', { className: 'empty', textContent: t().empty })]));
}

// wejście z linku #<id>: pokaż to ćwiczenie (zdejmij filtry), przewiń do niego i podświetl
function focusFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || !state.all.some((e) => e.id === id)) return;
  state.q = '';
  state.tags.clear();
  $('q').value = '';
  render();
  const node = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!node) return;
  highlight(node);
}

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function init() {
  state.lang = detectLang();
  $('q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
  $('tagClear').addEventListener('click', () => { state.tags.clear(); render(); });
  document.addEventListener('click', (e) => { if (!$('tagfilter').contains(e.target)) $('tagfilter').open = false; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('tagfilter').open = false; });
  $('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  $('lang').addEventListener('change', (e) => setLang(e.target.checked ? 'en' : 'pl'));
  window.addEventListener('hashchange', focusFromHash);
  applyLang();
  try {
    const data = await getJson('data/exercises.json');
    state.all = data.exercises || [];
    state.release = data.release || '';
    renderFooter();
    state.tagDb = (await getJson('data/tags.json').catch(() => ({}))).tags || {};
    render();
    focusFromHash();
  } catch {
    $('grid').replaceChildren(el('div', { className: 'empty', textContent: t().loadError }));
  }
}

init();
