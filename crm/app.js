// adres opublikowanej strony (GitHub Pages) — do generowania linków do ćwiczeń
const SITE_URL = 'https://matiwan3.github.io/exercises/';

const T = {
  saved: 'Zapisano',
  deleted: 'Usunięto',
  gifSaved: 'GIF zapisany',
  gifRemoved: 'GIF usunięty',
  confirmDelete: (n) => `Usunąć „${n}”? Tej operacji nie można cofnąć (poza gitem).`,
  newTitle: 'Nowe ćwiczenie',
  editTitle: 'Edycja ćwiczenia',
  empty: 'Brak ćwiczeń.',
  noGif: 'brak GIF-a',
  hintNew: 'Tylko 1 plik GIF (max 15 MB). Zostanie wgrany po kliknięciu „Zapisz”.',
  gifPending: 'GIF zostanie wgrany po zapisaniu ćwiczenia',
  gifUploadFailed: 'Ćwiczenie zapisane, ale GIF się nie wgrał: ',
  hintEdit: 'Tylko 1 plik GIF (max 15 MB). Wybranie pliku wgrywa go od razu i zastępuje poprzedni.',
  offline: 'Serwer CRM nie odpowiada — uruchom ponownie: npm run crm',
  gifOnly: 'Dozwolony jest tylko format GIF',
  tagsSaved: 'Tłumaczenia tagów zapisane',
  noTranslation: 'brak tłumaczenia',
  linkCopied: 'Link skopiowany: ',
};

const $ = (id) => document.getElementById(id);
const state = { items: [], selected: null, q: '', tagDb: {} };

function tagColor(t) {
  const c = state.tagDb[t] && state.tagDb[t].color;
  if (Number.isInteger(c)) return String(c);
  let h = 0;
  for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String(h % 13);
}

function el(tag, props = {}, ...children) {
  const { dataset, ...rest } = props;
  const n = Object.assign(document.createElement(tag), rest);
  if (dataset) Object.assign(n.dataset, dataset);
  n.append(...children);
  return n;
}

function toast(msg, isError = false) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.className = 'toast'), 2200);
}

async function call(method, url, body, raw = false) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body && !raw ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? (raw ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error(T.offline);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
  return data;
}

async function loadTags() {
  state.tagDb = (await call('GET', '/api/tags')).tags || {};
}

async function load() {
  state.items = (await call('GET', '/api/exercises')).exercises;
  await loadTags();
  renderList();
  renderTagSuggestions();
  renderTagRows();
}

function renderTagRows() {
  const rows = allTags().map((t) => {
    const input = el('input', { type: 'text', value: (state.tagDb[t] && state.tagDb[t].en) || '', placeholder: T.noTranslation, maxLength: 60 });
    input.dataset.tag = t;
    return el('div', { className: 'tr-row' }, el('span', { className: 'tag static', textContent: t, dataset: { c: tagColor(t) } }), input);
  });
  $('tagRows').replaceChildren(...rows);
}

function current() {
  return state.items.find((e) => e.id === state.selected) || null;
}

function allTags() {
  return [...new Set(state.items.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b, 'pl'));
}

function renderTagSuggestions() {
  $('tagSuggestions').replaceChildren(...allTags().map((t) => el('option', { value: t })));
  // klikalne istniejące tagi — dopisują się do pola
  const picked = parseTags($('tags').value);
  $('tagPicker').replaceChildren(
    ...allTags().map((t) =>
      el('button', {
        type: 'button',
        className: 'tag' + (picked.includes(t) ? ' active' : ''),
        textContent: t,
        dataset: { c: tagColor(t) },
        onclick: () => {
          const cur = parseTags($('tags').value);
          $('tags').value = (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]).join(', ');
          renderTagSuggestions();
        },
      })
    )
  );
}

function parseTags(s) {
  return [...new Set(s.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

function renderList() {
  const q = state.q.trim().toLowerCase();
  const items = state.items
    .filter((e) => !q || `${e.name} ${e.tags.join(' ')}`.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  $('list').replaceChildren(
    ...(items.length
      ? items.map((e) => {
          const thumb = el('div', { className: 'thumb' });
          if (e.gif) thumb.append(el('img', { src: `/gifs/${e.gif}`, alt: '', loading: 'lazy' }));
          else thumb.textContent = T.noGif;
          const tags = el('div', { className: 'tags' }, ...e.tags.map((t) => el('span', { className: 'tag static', textContent: t, dataset: { c: tagColor(t) } })));
          return el(
            'div',
            { className: 'item' + (e.id === state.selected ? ' selected' : '') },
            thumb,
            el('div', {}, el('h3', { textContent: e.name }), el('p', { className: 'hint item-id', textContent: `#${e.id}` }), tags),
            el(
              'div',
              { className: 'actions' },
              el('button', { className: 'btn ghost small', type: 'button', textContent: 'Link', title: 'Kopiuj link do ćwiczenia', onclick: () => copyLink(e) }),
              el('button', { className: 'btn ghost small', type: 'button', textContent: 'Edytuj', onclick: () => select(e.id) }),
              el('button', { className: 'btn danger small', type: 'button', textContent: 'Usuń', onclick: () => remove(e) })
            )
          );
        })
      : [el('div', { className: 'meta', textContent: T.empty })])
  );
}

async function copyLink(e) {
  const url = `${SITE_URL}#${e.id}`;
  try {
    await navigator.clipboard.writeText(url);
    toast(T.linkCopied + url);
  } catch {
    window.prompt('Link do ćwiczenia:', url);
  }
}

function renderForm() {
  const e = current();
  $('formTitle').textContent = e ? T.editTitle : T.newTitle;
  $('name').value = e ? e.name : '';
  $('description').value = e ? e.description : '';
  $('nameEn').value = e ? e.nameEn || '' : '';
  $('descriptionEn').value = e ? e.descriptionEn || '' : '';
  $('tags').value = e ? e.tags.join(', ') : '';
  $('gif').value = '';
  $('gifHint').textContent = e ? T.hintEdit : T.hintNew;
  $('gifPreview').hidden = !(e && e.gif);
  if (e && e.gif) $('gifPreview').firstElementChild.src = `/gifs/${e.gif}`;
  $('gifRemove').hidden = !(e && e.gif);
  renderTagSuggestions();
}

function select(id) {
  state.selected = id;
  renderForm();
  renderList();
  $('name').focus();
}

async function remove(e) {
  if (!confirm(T.confirmDelete(e.name))) return;
  try {
    await call('DELETE', `/api/exercises/${e.id}`);
    if (state.selected === e.id) state.selected = null;
    await load();
    renderForm();
    toast(T.deleted);
  } catch (err) {
    toast(err.message, true);
  }
}

function upsertLocal(ex) {
  const i = state.items.findIndex((x) => x.id === ex.id);
  i >= 0 ? (state.items[i] = ex) : state.items.push(ex);
}

$('form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const body = {
    name: $('name').value,
    description: $('description').value,
    nameEn: $('nameEn').value,
    descriptionEn: $('descriptionEn').value,
    tags: parseTags($('tags').value),
  };
  try {
    const e = current();
    const pendingGif = e ? null : $('gif').files[0]; // przy nowym ćwiczeniu GIF czeka na zapis
    let saved = e ? await call('PUT', `/api/exercises/${e.id}`, body) : await call('POST', '/api/exercises', body);
    upsertLocal(saved);
    state.selected = saved.id;
    let gifError = null;
    if (pendingGif) {
      try {
        saved = await call('PUT', `/api/exercises/${saved.id}/gif`, pendingGif, true);
        upsertLocal(saved);
      } catch (err) {
        gifError = err.message;
      }
    }
    await loadTags();
    renderTagRows();
    renderList();
    renderForm();
    gifError ? toast(T.gifUploadFailed + gifError, true) : toast(T.saved);
  } catch (err) {
    toast(err.message, true);
  }
});

$('gif').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  const e = current();
  if (!file) return;
  if (file.type !== 'image/gif' && !/\.gif$/i.test(file.name)) {
    toast(T.gifOnly, true);
    ev.target.value = '';
    return;
  }
  if (!e) {
    toast(T.gifPending); // plik zostaje w polu i wgra się przy „Zapisz”
    return;
  }
  try {
    const saved = await call('PUT', `/api/exercises/${e.id}/gif`, file, true);
    upsertLocal(saved);
    renderList();
    renderForm();
    toast(T.gifSaved);
  } catch (err) {
    toast(err.message, true);
    ev.target.value = '';
  }
});

$('gifRemove').addEventListener('click', async () => {
  const e = current();
  if (!e) return;
  try {
    upsertLocal(await call('DELETE', `/api/exercises/${e.id}/gif`));
    renderList();
    renderForm();
    toast(T.gifRemoved);
  } catch (err) {
    toast(err.message, true);
  }
});

$('saveTags').addEventListener('click', async () => {
  const en = {};
  for (const input of $('tagRows').querySelectorAll('input')) en[input.dataset.tag] = input.value;
  try {
    state.tagDb = (await call('PUT', '/api/tags', { en })).tags;
    renderTagRows();
    toast(T.tagsSaved);
  } catch (err) {
    toast(err.message, true);
  }
});

$('tags').addEventListener('input', renderTagSuggestions);
$('q').addEventListener('input', (e) => { state.q = e.target.value; renderList(); });
$('new').addEventListener('click', () => { state.selected = null; renderForm(); renderList(); $('name').focus(); });
$('cancel').addEventListener('click', () => { state.selected = null; renderForm(); renderList(); });

load().then(renderForm).catch((e) => toast(e.message, true));
