
'use strict';

const ICONS = {
  'Sistemas – Horácio': '▣',
  'Ponto e jornada': '◷',
  'Banco de horas': '▤',
  'Processos internos': '☷',
  'Projetos': '◇',
  'Dúvidas gerais': '?'
};

const DEFAULT_CATS = Object.keys(ICONS);

let records = [];
let category = 'Todas';
let term = '';

const $ = id => document.getElementById(id);

const norm = s =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function clean(raw, i) {
  return {
    id: String(raw.id || i + 1).trim(),
    pergunta: String(raw.pergunta || '').trim(),
    resposta: String(raw.resposta || ''),
    categoria: String(raw.categoria || 'Dúvidas gerais').trim(),
    palavras: String(raw['palavras-chave'] || raw.palavras || ''),
    atualizacao: String(raw['ultima atualizacao'] || raw.atualizacao || ''),
    materiais: String(raw.materiais || '')
  };
}

// Remove Recursos Humanos somente da navegação.
// As perguntas continuam preservadas na base.
function cats() {
  return [
    ...new Set([
      ...DEFAULT_CATS,
      ...records.map(r => r.categoria)
    ])
  ].filter(c => norm(c) !== norm('Recursos Humanos'));
}

function count(c) {
  return records.filter(r => r.categoria === c).length;
}

function renderCats() {
  const root = $('categories');
  root.replaceChildren();

  cats().forEach(c => {
    const b = document.createElement('button');
    b.className = 'category';

    const icon = document.createElement('span');
    icon.className = 'cat-icon';
    icon.textContent = ICONS[c] || '▦';

    const name = document.createElement('strong');
    name.textContent = c;

    const n = document.createElement('small');
    n.textContent = `${count(c)} orientações`;

    b.append(icon, name, n);
    b.onclick = () => select(c);

    root.append(b);
  });
}

function renderFilters() {
  const root = $('filters');
  root.replaceChildren();

  ['Todas', ...cats()].forEach(c => {
    const b = document.createElement('button');

    b.className = 'filter' +
      (category === c ? ' active' : '');

    b.textContent = c === 'Todas'
      ? `Todas as categorias (${records.length})`
      : `${c} (${count(c)})`;

    b.onclick = () => select(c);
    root.append(b);
  });
}

function select(c) {
  category = c;
  render();

  if (location.hash !== '#perguntas') {
    location.hash = 'perguntas';
  }

  $('listtitle').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function render() {
  renderFilters();

  const filtered = records.filter(r =>
    (category === 'Todas' || r.categoria === category) &&
    norm([
      r.pergunta,
      r.resposta,
      r.categoria,
      r.palavras
    ].join(' ')).includes(norm(term))
  );

  $('listtitle').textContent = term
    ? 'Resultados da pesquisa'
    : category === 'Todas'
      ? 'Perguntas frequentes'
      : category;

  $('resultcount').textContent =
    `${filtered.length} resultado(s)`;

  $('count').textContent =
    `${records.length} orientações disponíveis`;

  const root = $('questions');
  root.replaceChildren();

  if (!filtered.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent =
      'Nenhuma dúvida encontrada. Experimente outro termo ou categoria.';

    root.append(e);
    return;
  }

  filtered.forEach(r => {
    const b = document.createElement('button');
    b.className = 'question';
    b.type = 'button';

    const top = document.createElement('div');
    top.className = 'qtop';

    const title = document.createElement('strong');
    title.textContent = r.pergunta;

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '→';

    top.append(title, arrow);

    const meta = document.createElement('div');
    meta.className = 'qmeta';
    meta.textContent = r.categoria +
      (r.atualizacao ? ' · Atualizado em ' + r.atualizacao : '');

    b.append(top, meta);

    b.addEventListener('click', () => {
      location.hash = 'duvida/' + encodeURIComponent(r.id);
    });

    root.append(b);
  });
}

function safeUrl(value) {
  try {
    const u = new URL(value, location.href);

    return ['https:', 'http:'].includes(u.protocol)
      ? u.href
      : null;
  } catch {
    return null;
  }
}

function answerNodes(text) {
  const root = $('detailbody');
  root.replaceChildren();

  let list = null;

  String(text || '').split(/\r?\n/).forEach(line => {
    const t = line.trim();

    if (!t) {
      list = null;
      return;
    }

    const match = t.match(/^\d+[.)]\s+(.+)/);

    if (match) {
      if (!list) {
        list = document.createElement('ol');
        root.append(list);
      }

      const li = document.createElement('li');
      li.textContent = match[1];
      list.append(li);

    } else if (/^https?:\/\/\S+$/i.test(t)) {
      list = null;

      const a = document.createElement('a');
      a.href = safeUrl(t) || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = t;

      root.append(a);

    } else {
      list = null;

      const p = document.createElement('p');
      p.textContent = t;
      root.append(p);
    }
  });
}

function openQuestion(id) {
  const r = records.find(
    x => String(x.id) === String(id)
  );

  if (!r) {
    console.error('Pergunta não encontrada:', id);
    showHome();

    $('notice').hidden = false;
    $('notice').textContent =
      'Não foi possível localizar essa pergunta. Verifique se a base de dados está atualizada.';

    return;
  }

  $('notice').hidden = true;
  $('home').hidden = true;
  $('detail').hidden = false;

  $('detailmeta').textContent = r.categoria;
  $('detailtitle').textContent = r.pergunta;

  answerNodes(r.resposta);

  const resources = $('resources');
  resources.replaceChildren();

  const items = r.materiais
    .split(/\s*\|\s*/)
    .map(s => s.trim())
    .filter(Boolean);

  if (items.length) {
    const box = document.createElement('div');
    box.className = 'resources';

    const h = document.createElement('h3');
    h.textContent = 'Materiais complementares';
    box.append(h);

    items.forEach(item => {
      const [label, ...rest] = item.split('::');
      const url = safeUrl(rest.length ? rest.join('::') : label);

      if (!url) return;

      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = rest.length ? label : url;

      box.append(a);
    });

    resources.append(box);
  }

  $('detailfooter').textContent =
    'Última atualização: ' +
    (r.atualizacao || 'não informada');

  window.scrollTo(0, 0);
}

function showHome() {
  $('home').hidden = false;
  $('detail').hidden = true;
}

function route() {
  const hash = location.hash || '#inicio';

  if (hash.startsWith('#duvida/')) {
    const id = decodeURIComponent(
      hash.substring('#duvida/'.length)
    );

    openQuestion(id);
    return;
  }

  showHome();

  if (hash === '#perguntas') {
    setTimeout(() => {
      $('listtitle').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  }
}

function csvParse(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let quote = false;

  csv = csv.replace(/^\uFEFF/, '');

  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];

    if (c === '"') {
      if (quote && csv[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quote = !quote;
      }

    } else if (c === ',' && !quote) {
      row.push(field);
      field = '';

    } else if ((c === '\n' || c === '\r') && !quote) {
      if (c === '\r' && csv[i + 1] === '\n') i++;

      row.push(field);

      if (row.some(x => x.trim())) {
        rows.push(row);
      }

      row = [];
      field = '';

    } else {
      field += c;
    }
  }

  row.push(field);

  if (row.some(x => x.trim())) {
    rows.push(row);
  }

  const heads = (rows.shift() || [])
    .map(x => norm(x.trim()));

  return rows.map(r =>
    Object.fromEntries(
      heads.map((h, i) => [h, r[i] || ''])
    )
  );
}

async function init() {
  try {
    const url = window.CENTRAL_CONFIG?.csvUrl?.trim();

    const dataUrl = url || new URL(
      './dados.json',
      document.baseURI
    ).href;

    const response = await fetch(
      dataUrl,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(
        'Erro ao acessar a base: HTTP ' + response.status +
        ' — ' + dataUrl
      );
    }

    let raw;

    if (url) {
      const csv = await response.text();
      raw = csvParse(csv);

    } else {
      const content = (await response.text())
        .replace(/^\uFEFF/, '')
        .trim();

      try {
        raw = JSON.parse(content);
      } catch (parseError) {
        console.error(
          'Conteúdo recebido de dados.json:',
          content.slice(0, 300)
        );

        throw new Error(
          'O dados.json não contém JSON válido. ' +
          'Verifique o arquivo publicado no GitHub. ' +
          parseError.message
        );
      }
    }

    if (!Array.isArray(raw)) {
      throw new Error(
        'A base precisa ser uma lista de perguntas entre colchetes [ ].'
      );
    }

    records = raw
      .map(clean)
      .filter(r => r.pergunta);

    if (!records.length) {
      throw new Error('Base de perguntas vazia.');
    }

    renderCats();
    render();
    route();

    $('notice').hidden = true;

  } catch (error) {
    console.error('Erro ao carregar a Central:', error);

    $('notice').hidden = false;
    $('notice').textContent =
      'Não foi possível carregar as perguntas. Detalhe: ' +
      error.message;
  }
}

// Pesquisa
$('search').addEventListener('input', e => {
  term = e.target.value;
  category = 'Todas';

  render();

  if (!$('detail').hidden) {
    location.hash = 'perguntas';
  }
});

// Navegação
$('all').onclick = () => select('Todas');

$('back').onclick = () => {
  location.hash = 'perguntas';
};

window.addEventListener('hashchange', route);

window.addEventListener('keydown', e => {
  if (
    e.key === '/' &&
    !['INPUT', 'TEXTAREA'].includes(
      document.activeElement.tagName
    )
  ) {
    e.preventDefault();
    $('search').focus();
  }
});

init();
