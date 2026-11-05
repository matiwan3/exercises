// Publiczna strona — czyta data/exercises.json, wszystko po stronie przeglądarki.

const T = {
  noGif: 'brak GIF-a',
  empty: 'Brak ćwiczeń spełniających kryteria.',
  loadError: 'Nie udało się wczytać danych.',
  count: (n, total) => `Wyświetlono ${n} z ${total}`,
  clear: 'wyczyść filtry',
  disclaimer:
    'Baza ćwiczeń ma charakter wyłącznie informacyjny i edukacyjny. Przed rozpoczęciem treningu upewnij się, że nie masz przeciwwskazań zdrowotnych. Wszystkie ćwiczenia wykonujesz na własną odpowiedzialność. Obciążenie należy dobrać indywidualnie do możliwości i stażu treningowego.',
  copyright: 'matiwan © 2026',
};

// Linki w stopce. Pusty adres = link się nie wyświetla (uzupełnij YouTube poniżej).
const LINKS = [
  { label: 'youtube', url: 'https://www.youtube.com/@matiwann' },
  { label: 'sklep', url: 'https://www.naffy.io/matiwan' },
];

function renderFooter() {
  $('disclaimer').textContent = T.disclaimer;
  const parts = [document.createTextNode(T.copyright)];
  for (const l of LINKS.filter((l) => l.url)) {
    parts.push(document.createTextNode(' | '), el('a', { href: l.url, textContent: l.label, target: '_blank', rel: 'noopener noreferrer' }));
  }
  $('footerLinks').replaceChildren(...parts);
}

const $ = (id) => document.getElementById(id);
const state = { all: [], q: '', tags: new Set(), sort: 'name-asc' };

const SORTERS = {
  'name-asc': (a, b) => a.name.localeCompare(b.name, 'pl'),
  'name-desc': (a, b) => b.name.localeCompare(a.name, 'pl'),
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
  old: (a, b) => a.createdAt.localeCompare(b.createdAt),
};

function el(tag, props = {}, ...children) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...children);
  return n;
}

// stały kolor dla danego tagu (0–5, patrz --tag-N w CSS)
function tagColor(t) {
  let h = 0;
  for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String(h % 6);
}

function tagBtn(t, onclick) {
  const b = el('button', { className: 'tag' + (state.tags.has(t) ? ' active' : ''), type: 'button', textContent: t, onclick });
  b.dataset.c = tagColor(t);
  return b;
}

function toggleTag(t) {
  state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t);
  render();
}

function visible() {
  const q = state.q.trim().toLowerCase();
  return state.all
    .filter((e) => !q || `${e.name} ${e.description} ${e.tags.join(' ')}`.toLowerCase().includes(q))
    .filter((e) => [...state.tags].every((t) => e.tags.includes(t))) // AND
    .sort(SORTERS[state.sort]);
}

function card(e) {
  const media = el('div', { className: 'media' });
  if (e.gif) media.append(el('img', { src: `gifs/${e.gif}`, alt: e.name, loading: 'lazy' }));
  else media.textContent = T.noGif;

  const tags = el('div', { className: 'tags' });
  for (const t of e.tags) tags.append(tagBtn(t, () => toggleTag(t)));
  return el('article', { className: 'card' }, media, el('div', { className: 'body' }, el('h3', { textContent: e.name }), el('p', { textContent: e.description }), tags));
}

function render() {
  // chipy tagów (wszystkie istniejące tagi)
  const all = [...new Set(state.all.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b, 'pl'));
  $('tags').replaceChildren(...all.map((t) => tagBtn(t, () => toggleTag(t))));

  const list = visible();
  const meta = el('span', { textContent: T.count(list.length, state.all.length) });
  $('meta').replaceChildren(meta);
  if (state.q || state.tags.size) {
    $('meta').append(el('button', { type: 'button', textContent: T.clear, onclick: () => { state.q = ''; state.tags.clear(); $('q').value = ''; render(); } }));
  }
  $('grid').replaceChildren(...(list.length ? list.map(card) : [el('div', { className: 'empty', textContent: T.empty })]));
}

async function init() {
  renderFooter();
  $('q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
  $('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  try {
    const res = await fetch('data/exercises.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    state.all = (await res.json()).exercises || [];
    render();
  } catch {
    $('grid').replaceChildren(el('div', { className: 'empty', textContent: T.loadError }));
  }
}

init();
