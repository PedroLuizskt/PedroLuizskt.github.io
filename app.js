/* =========================================================================
   PORTFOLIO PEDRO LUIZ R. VAZ DE MELO - V7.0
   Conteudo: data.json (portugues, fonte principal) e data.en.json (ingles,
   so os textos traduzidos, sobrepostos ao data.json pelo id ou pela posicao).
   Textos fixos da interface: dicionario UI abaixo e atributos data-i18n no
   index.html. Este arquivo renderiza e liga os comportamentos: idioma, mapas
   ao vivo, filtros, cards, painel com galeria, previa em video, navegacao.
   ========================================================================= */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const isPlaceholder = (t) => /^\s*\[/.test(String(t || ''));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

const ICON_EXT = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 11l6-6M6.5 5H11v4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SWATCHES = ['#6BC17C', '#6EA9E8', '#D4A574', '#B26AC7', '#9FB3C8', '#7FC9C0', '#E0C27A'];
const LANGS = ['pt', 'en'];
const LANG_KEY = 'portfolio-lang';

const state = {
  lang: 'pt',
  data: null,
  cache: { base: null, en: null },
  byId: new Map(),
  filter: 'all',
  live: { items: [], index: 0 },
  dialog: { project: null, items: [], index: 0, trigger: null },
};

/* Versao das midias (campo "versao" do data.json): entra na URL de cada imagem e video.
   Ao trocar arquivos mantendo o nome, suba a versao e o navegador busca tudo de novo. */
const V = (u) => (u ? `${u}${u.includes('?') ? '&' : '?'}v=${encodeURIComponent(state.data?.versao || '1')}` : u);

/* ------------------------------------------------------------------------
   Textos da interface (PT e EN). As chaves usadas no index.html aparecem
   em data-i18n="chave" (texto) e data-i18n-attr="atributo:chave".
   ------------------------------------------------------------------------ */
const UI = {
  pt: {
    'meta.title': 'Pedro Luiz R. Vaz de Melo | Engenheiro Florestal e Cientista de Dados Geoespaciais',
    'meta.desc': 'Portfólio de Pedro Luiz R. Vaz de Melo: engenheiro florestal e cientista de dados geoespaciais. WebMaps, pipelines no Google Earth Engine, machine learning florestal e APIs.',
    'meta.locale': 'pt_BR',
    'skip': 'Ir para o conteúdo',
    'brand.aria': 'Pedro Luiz R. Vaz de Melo, início',
    'nav.aria': 'Navegação principal',
    'nav.mapas': 'Mapas ao vivo',
    'nav.projetos': 'Projetos',
    'nav.consultorias': 'Consultorias',
    'nav.panorama': 'Panorama',
    'nav.trajeto': 'Trajeto',
    'nav.contato': 'Contato',
    'lang.aria': 'Idioma do site',
    'menu.open': 'Abrir menu',
    'menu.close': 'Fechar menu',
    'hero.lead': 'Engenheiro florestal e cientista de dados geoespaciais. Transformo dados ambientais brutos em produtos reprodutíveis: pipelines que levam de dias para minutos, servidos como WebMaps, dashboards e APIs.',
    'hero.formacao.dt': 'Formação',
    'hero.formacao.dd': 'Engenharia Florestal, UFSJ (2025)',
    'hero.atuacao.dt': 'Atuação',
    'hero.atuacao.dd': 'EnvironBIT (CNPq) e Vimef Engenharia',
    'hero.agora.dt': 'Agora',
    'hero.agora.dd': 'Aberto a projetos e consultorias',
    'hero.cta1': 'Ver projetos',
    'hero.cta2': 'Abrir os mapas ao vivo',
    'hero.h3': 'H3 resolução 8',
    'mapas.title': 'Mapas ao vivo',
    'mapas.note': 'Os WebMaps publicados, rodando aqui dentro. Escolha um e carregue quando quiser.',
    'mapas.tabs': 'Escolher mapa',
    'mapas.load': 'Carregar mapa interativo',
    'mapas.open': 'Abrir em nova aba',
    'mapas.details': 'Ver detalhes do projeto',
    'mapas.poster': 'Prévia do mapa {t}',
    'mapas.iframe': 'Mapa interativo: {t}',
    'projetos.title': 'Projetos',
    'projetos.note': 'Do dado bruto ao produto final, com código aberto. Clique em um card para ver a galeria completa.',
    'projetos.filters': 'Filtrar projetos por tema',
    'projetos.loading': 'Carregando projetos…',
    'projetos.empty': 'Nenhum projeto com esse tema.',
    'projetos.showAll': 'Mostrar todos',
    'projetos.moreLink': 'Todos os repositórios no GitHub',
    'filters.all': 'Todos',
    'card.code': 'Código',
    'card.demo': 'Demo',
    'card.demoBadge': 'Demo ao vivo',
    'card.img1': 'imagem',
    'card.imgN': 'imagens',
    'card.video': 'Vídeo',
    'card.details': 'Detalhes',
    'card.detailsAria': 'Ver detalhes de {t}',
    'card.proposal': 'Pedir proposta',
    'more.title': 'Todos os repositórios',
    'more.text': 'Pacotes, estudos e notebooks que não couberam nesta seleção.',
    'more.cta': 'Abrir no GitHub',
    'consult.title': 'Consultorias',
    'consult.cta': 'Pedir uma proposta',
    'consult.subject': 'Consultoria: {t}',
    'consult.local': 'Consultoria',
    'pd.close': 'Fechar painel',
    'pd.prev': 'Mídia anterior',
    'pd.next': 'Próxima mídia',
    'pd.tools': 'Ferramentas',
    'pd.videoCaption': 'Em movimento: gravação da interface',
    'pd.deliver': 'O que é entregue',
    'pd.highlights': 'Destaques',
    'pd.proposal': 'Pedir uma proposta',
    'pd.demo': 'Abrir a demo',
    'pd.code': 'Ver o código no GitHub',
    'pd.thumb': 'Mostrar mídia {n}: {t}',
    'pd.of': '{i} de {n}.',
    'pd.full': 'Abrir em tamanho real',
    'panorama.title': 'Panorama',
    'panorama.lead': 'Uno inteligência territorial e ciência de dados a arquiteturas de back-end de alta performance.',
    'panorama.p1': 'Sou engenheiro florestal (UFSJ, 2025) e cientista de dados geoespaciais, com base sólida em desenvolvimento back-end. Meu trabalho junta três exigências: rigor científico, desempenho de produção e clareza para quem toma a decisão.',
    'panorama.p2': 'Na prática, automatizo pipelines de dados ambientais com Python (GeoPandas, Rasterio, PyArrow) e Google Earth Engine, sirvo os resultados por APIs em Node.js, TypeScript ou FastAPI e materializo tudo em WebMaps e dashboards que substituem PDFs estáticos por evidência navegável.',
    'panorama.p3': 'Hoje sou cientista de dados na EnvironBIT (projeto CNPq) e consultor de geoprocessamento e desenvolvimento GIS na Vimef Engenharia, em linhas de transmissão e projetos de compensação ambiental. Curso pós-graduação em Ciência de Dados na Data Science Academy.',
    'camadas.title': 'Camadas',
    'camadas.note': 'Ferramentas organizadas como camadas de um projeto GIS: cada uma apoia a de cima.',
    'trajeto.title': 'Trajeto',
    'trajeto.note': 'Experiência profissional e formação.',
    'trajeto.formacao': 'Formação',
    'trajeto.idiomas': 'Idiomas',
    'trajeto.cv': 'Baixar currículo em PDF',
    'contato.title': 'Contato',
    'contato.note': 'Consultorias, colaborações e conversas técnicas.',
    'contato.copy': 'Copiar e-mail',
    'contato.base.dt': 'Base',
    'contato.base.dd': 'Cambuquira, MG, trabalho remoto',
    'footer.stack': 'HTML, CSS e JavaScript sem framework.',
    'footer.source': 'Código-fonte',
    'toast.copied': 'E-mail copiado.',
    'toast.manual': 'Copie manualmente: {e}',
    'error.load': 'Os projetos não carregaram. Abra o site por um servidor HTTP (veja o guia, seção 1) e recarregue.',
  },
  en: {
    'meta.title': 'Pedro Luiz R. Vaz de Melo | Forest Engineer and Geospatial Data Scientist',
    'meta.desc': 'Portfolio of Pedro Luiz R. Vaz de Melo, forest engineer and geospatial data scientist: WebMaps, Google Earth Engine pipelines, forestry machine learning and APIs.',
    'meta.locale': 'en_US',
    'skip': 'Skip to content',
    'brand.aria': 'Pedro Luiz R. Vaz de Melo, home',
    'nav.aria': 'Main navigation',
    'nav.mapas': 'Live maps',
    'nav.projetos': 'Projects',
    'nav.consultorias': 'Consulting',
    'nav.panorama': 'About',
    'nav.trajeto': 'Experience',
    'nav.contato': 'Contact',
    'lang.aria': 'Site language',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    'hero.lead': 'Forest engineer and geospatial data scientist. I turn raw environmental data into reproducible products: pipelines that take days down to minutes, delivered as WebMaps, dashboards and APIs.',
    'hero.formacao.dt': 'Education',
    'hero.formacao.dd': 'B.Sc. Forestry Engineering, UFSJ (2025)',
    'hero.atuacao.dt': 'Working at',
    'hero.atuacao.dd': 'EnvironBIT (CNPq) and Vimef Engenharia',
    'hero.agora.dt': 'Now',
    'hero.agora.dd': 'Open to projects and consulting',
    'hero.cta1': 'See projects',
    'hero.cta2': 'Open the live maps',
    'hero.h3': 'H3 resolution 8',
    'mapas.title': 'Live maps',
    'mapas.note': 'The published WebMaps, running right here. Pick one and load it whenever you like.',
    'mapas.tabs': 'Choose a map',
    'mapas.load': 'Load interactive map',
    'mapas.open': 'Open in a new tab',
    'mapas.details': 'See project details',
    'mapas.poster': 'Preview of the {t} map',
    'mapas.iframe': 'Interactive map: {t}',
    'projetos.title': 'Projects',
    'projetos.note': 'From raw data to finished product, with open-source code. Click a card to see the full gallery.',
    'projetos.filters': 'Filter projects by topic',
    'projetos.loading': 'Loading projects…',
    'projetos.empty': 'No projects with this topic.',
    'projetos.showAll': 'Show all',
    'projetos.moreLink': 'All repositories on GitHub',
    'filters.all': 'All',
    'card.code': 'Code',
    'card.demo': 'Demo',
    'card.demoBadge': 'Live demo',
    'card.img1': 'image',
    'card.imgN': 'images',
    'card.video': 'Video',
    'card.details': 'Details',
    'card.detailsAria': 'See details of {t}',
    'card.proposal': 'Request a proposal',
    'more.title': 'All repositories',
    'more.text': 'Packages, studies and notebooks that did not fit in this selection.',
    'more.cta': 'Open on GitHub',
    'consult.title': 'Consulting',
    'consult.cta': 'Request a proposal',
    'consult.subject': 'Consulting: {t}',
    'consult.local': 'Consulting',
    'pd.close': 'Close panel',
    'pd.prev': 'Previous media',
    'pd.next': 'Next media',
    'pd.tools': 'Tools',
    'pd.videoCaption': 'In motion: screen recording of the interface',
    'pd.deliver': 'What is delivered',
    'pd.highlights': 'Highlights',
    'pd.proposal': 'Request a proposal',
    'pd.demo': 'Open the demo',
    'pd.code': 'See the code on GitHub',
    'pd.thumb': 'Show media {n}: {t}',
    'pd.of': '{i} of {n}.',
    'pd.full': 'Open full size',
    'panorama.title': 'About',
    'panorama.lead': 'I bring together territorial intelligence, data science and high-performance back-end architectures.',
    'panorama.p1': 'I am a forest engineer (UFSJ, 2025) and geospatial data scientist with a solid background in back-end development. My work combines three demands: scientific rigor, production performance and clarity for whoever makes the decision.',
    'panorama.p2': 'In practice, I automate environmental data pipelines with Python (GeoPandas, Rasterio, PyArrow) and Google Earth Engine, serve the results through APIs in Node.js, TypeScript or FastAPI, and turn everything into WebMaps and dashboards that replace static PDFs with evidence you can explore.',
    'panorama.p3': 'Today I am a data scientist at EnvironBIT (a CNPq-funded project) and a geoprocessing and GIS development consultant at Vimef Engenharia, working on power transmission lines and environmental compensation projects. I am also pursuing a postgraduate degree in Data Science at Data Science Academy.',
    'camadas.title': 'Layers',
    'camadas.note': 'Tools organized like the layers of a GIS project: each one supports the one above it.',
    'trajeto.title': 'Experience',
    'trajeto.note': 'Professional experience and education.',
    'trajeto.formacao': 'Education',
    'trajeto.idiomas': 'Languages',
    'trajeto.cv': 'Download resume (PDF)',
    'contato.title': 'Contact',
    'contato.note': 'Consulting, collaborations and technical conversations.',
    'contato.copy': 'Copy e-mail',
    'contato.base.dt': 'Based in',
    'contato.base.dd': 'Cambuquira, MG, Brazil, working remotely',
    'footer.stack': 'HTML, CSS and JavaScript, no framework.',
    'footer.source': 'Source code',
    'toast.copied': 'E-mail copied.',
    'toast.manual': 'Copy it manually: {e}',
    'error.load': 'The projects did not load. Open the site through an HTTP server (see the guide, section 1) and reload.',
  },
};

function t(key, vars = {}) {
  const dict = UI[state.lang] || UI.pt;
  let s = dict[key] ?? UI.pt[key];
  if (s === undefined) { console.warn(`[AVISO] chave de texto ausente: ${key}`); return key; }
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

/* ------------------------------------------------------------------------
   Idioma: ?lang=en|pt na URL > escolha salva > idioma do navegador
   ------------------------------------------------------------------------ */
function readPref() { try { return localStorage.getItem(LANG_KEY); } catch { return null; } }
function savePref(lang) { try { localStorage.setItem(LANG_KEY, lang); } catch { /* armazenamento indisponivel */ } }

function detectLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(q)) return q;
  const saved = readPref();
  if (LANGS.includes(saved)) return saved;
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'pt';
  return /^pt\b/i.test(nav) ? 'pt' : 'en';
}

function applyStatic() {
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'pt-BR';
  document.title = t('meta.title');
  $('meta[name="description"]')?.setAttribute('content', t('meta.desc'));
  $('meta[property="og:locale"]')?.setAttribute('content', t('meta.locale'));
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
  $$('.lang-opt').forEach((a) => (a.dataset.lang === state.lang ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  const toggle = $('.nav-toggle');
  if (toggle) toggle.setAttribute('aria-label', t(toggle.getAttribute('aria-expanded') === 'true' ? 'menu.close' : 'menu.open'));
}

/* Sobreposicao do ingles: objetos por chave; listas de objetos pelo "id"
   (ou "projeto"), senao pela posicao; listas de textos sao trocadas inteiras.
   Campo sem traducao continua em portugues. */
function mergeOverlay(base, over) {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    if (base.length && base[0] && typeof base[0] === 'object') {
      const key = ['id', 'projeto'].find((k) => base[0][k] !== undefined && over.some((o) => o && o[k] !== undefined));
      if (key) return base.map((b) => { const o = over.find((x) => x && x[key] === b[key]); return o ? mergeOverlay(b, o) : b; });
      return base.map((b, i) => (over[i] ? mergeOverlay(b, over[i]) : b));
    }
    return over;
  }
  if (base && typeof base === 'object' && over && typeof over === 'object' && !Array.isArray(over)) {
    const out = { ...base };
    Object.keys(over).forEach((k) => { out[k] = k in base ? mergeOverlay(base[k], over[k]) : over[k]; });
    return out;
  }
  return over;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return res.json();
}

async function getData(lang) {
  if (!state.cache.base) state.cache.base = await fetchJson('data.json');
  const base = structuredClone(state.cache.base);
  if (lang !== 'en') return base;
  try {
    if (!state.cache.en) state.cache.en = await fetchJson('data.en.json');
    return mergeOverlay(base, structuredClone(state.cache.en));
  } catch (err) {
    console.warn('[AVISO] data.en.json indisponivel; conteudo segue em portugues.', err);
    return base;
  }
}

/* ------------------------------------------------------------------------
   Utilitarios
   ------------------------------------------------------------------------ */
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
}

const metricsHtml = (list = []) => list.slice(0, 3)
  .map((m) => `<div><dt>${esc(m.rotulo)}</dt><dd title="${esc(m.valor)}">${esc(m.valor)}</dd></div>`).join('');

function proposalHref(assunto) {
  const d = state.data;
  const subject = assunto || d?.consultorias?.cta?.assunto || t('consult.title');
  return `mailto:${d.autor.email}?subject=${encodeURIComponent(subject)}`;
}

/* ------------------------------------------------------------------------
   Mapas ao vivo
   ------------------------------------------------------------------------ */
function selectLive(i, focus = false) {
  const items = state.live.items;
  const it = items[i];
  if (!it) return;
  state.live.index = i;
  const tabs = $('#live-tabs');
  const p = state.byId.get(it.projeto);
  $$('.live-tab', tabs).forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
  if (focus) $(`#live-tab-${i}`).focus();
  const frame = $('#live-frame');
  frame.classList.remove('is-loaded');
  $('iframe', frame)?.remove();
  const poster = $('#live-poster');
  poster.src = p ? V(p.midia.capa) : '';
  poster.alt = p ? t('mapas.poster', { t: p.titulo }) : '';
  $('#live-warn').textContent = it.aviso || '';
  $('#live-desc').textContent = p ? p.resumo : '';
  $('#live-open').href = it.url;
  $('#live-load').onclick = () => {
    const f = document.createElement('iframe');
    f.src = it.url;
    f.title = t('mapas.iframe', { t: p ? p.titulo : it.rotulo });
    f.loading = 'lazy';
    f.allow = 'fullscreen';
    frame.appendChild(f);
    frame.classList.add('is-loaded');
  };
  $('#live-details').onclick = (e) => p && openProject(p.id, e.currentTarget);
  frame.setAttribute('aria-labelledby', `live-tab-${i}`);
}

function renderLive(items) {
  state.live.items = items;
  if (!items.length) { $('#mapas').hidden = true; return; }
  $('#live-tabs').innerHTML = items.map((it, i) => `
    <button type="button" class="live-tab" role="tab" id="live-tab-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-index="${i}">${esc(it.rotulo)}</button>`).join('');
  selectLive(Math.min(state.live.index, items.length - 1));
}

function initLive() {
  const tabs = $('#live-tabs');
  tabs.addEventListener('click', (e) => { const b = e.target.closest('.live-tab'); if (b) selectLive(+b.dataset.index); });
  tabs.addEventListener('keydown', (e) => {
    const n = state.live.items.length;
    if (!n) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); selectLive((state.live.index + 1) % n, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); selectLive((state.live.index - 1 + n) % n, true); }
  });
}

/* ------------------------------------------------------------------------
   Cards: mesma estrutura de 5 linhas para projetos e consultorias
   (capa, cabecalho, resumo, metricas ou entregas, acoes)
   ------------------------------------------------------------------------ */
function cardHtml(p) {
  const consult = p.tipo === 'consultoria';
  const hasDemo = !!p.links?.demo;
  const links = consult
    ? `<a href="${esc(proposalHref(t('consult.subject', { t: p.titulo })))}">${esc(t('card.proposal'))}</a>`
    : [
      p.links.codigo ? `<a href="${esc(p.links.codigo)}" target="_blank" rel="noopener">${esc(t('card.code'))} ${ICON_EXT}</a>` : '',
      hasDemo ? `<a href="${esc(p.links.demo)}" target="_blank" rel="noopener">${esc(t('card.demo'))} ${ICON_EXT}</a>` : '',
    ].join('');
  const row4 = consult
    ? `<ul class="card-list">${p.entregaveis.map((e) => `<li${isPlaceholder(e) ? ' class="is-placeholder"' : ''}>${esc(e)}</li>`).join('')}</ul>`
    : `<dl class="metrics">${metricsHtml(p.metricas)}</dl>`;
  const accent = consult ? 'consult' : p.tags[0];
  const alt = p.midia.galeria?.[0]?.legenda || p.titulo;
  const nImg = p.midia.galeria?.length || 0;
  return `
    <article class="card" data-id="${esc(p.id)}" data-accent="${esc(accent)}" data-tags="${esc((p.tags || []).join(' '))}">
      <div class="card-media">
        <img src="${esc(V(p.midia.capaMini || p.midia.capa))}" srcset="${esc(V(p.midia.capaMini))} 800w, ${esc(V(p.midia.capa))} 1600w"
             sizes="(max-width: 760px) 100vw, 400px" alt="${esc(alt)}" loading="lazy" decoding="async" width="800" height="500" />
        ${hasDemo ? `<span class="card-badge">${esc(t('card.demoBadge'))}</span>` : ''}
        ${consult ? `<span class="card-badge card-badge-consult">${nImg} ${esc(t(nImg > 1 ? 'card.imgN' : 'card.img1'))}</span>` : ''}
        ${p.midia.video ? `<span class="card-play" aria-hidden="true">${esc(t('card.video'))}</span>` : ''}
      </div>
      <div class="card-head">
        <p class="card-local">${esc(p.local)}</p>
        <h3 class="card-title"><button type="button" class="card-open" data-open="${esc(p.id)}">${esc(p.titulo)}</button></h3>
      </div>
      <p class="card-summary">${esc(p.resumo)}</p>
      ${row4}
      <div class="card-actions">
        ${links}
        <button type="button" class="card-details" data-open="${esc(p.id)}" aria-label="${esc(t('card.detailsAria', { t: p.titulo }))}">${esc(t('card.details'))}</button>
      </div>
    </article>`;
}

// Quadro final da grade: completa a fileira e leva a todos os repositorios
function moreTileHtml(url) {
  return `
    <a class="card-more" id="proj-more" href="${esc(url)}" target="_blank" rel="noopener">
      <svg class="card-more-mark" viewBox="0 0 60 52" width="60" height="52" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
        <polygon points="15,1 29,9 29,25 15,33 1,25 1,9" /><polygon points="45,1 59,9 59,25 45,33 31,25 31,9" opacity=".55" />
        <polygon points="30,18 44,26 44,42 30,50 16,42 16,26" opacity=".3" />
      </svg>
      <span class="card-more-body">
        <span class="card-more-kicker">GitHub</span>
        <span class="card-more-title">${esc(t('more.title'))}</span>
        <span class="card-more-text">${esc(t('more.text'))}</span>
        <span class="card-more-cta">${esc(t('more.cta'))} ${ICON_EXT}</span>
      </span>
    </a>`;
}

function renderProjects(projects, githubUrl) {
  $('#proj-grid').innerHTML = projects.map(cardHtml).join('') + (githubUrl ? moreTileHtml(`${githubUrl}?tab=repositories`) : '');
}

/* Previa em video: so com mouse e sem movimento reduzido */
function initHoverPreview() {
  if (!canHover.matches || reduceMotion.matches) return;
  $$('.card').forEach((card) => {
    const p = state.byId.get(card.dataset.id);
    if (!p?.midia.video || card.dataset.hover) return;
    card.dataset.hover = '1';
    const media = $('.card-media', card);
    let video = null;
    card.addEventListener('pointerenter', () => {
      if (!video) {
        video = document.createElement('video');
        Object.assign(video, { src: V(p.midia.video), muted: true, loop: true, playsInline: true, preload: 'auto' });
        video.setAttribute('aria-hidden', 'true');
        media.appendChild(video);
      }
      video.play().then(() => media.classList.add('is-playing')).catch(() => {});
    });
    card.addEventListener('pointerleave', () => {
      media.classList.remove('is-playing');
      if (video) video.pause();
    });
  });
}

/* ------------------------------------------------------------------------
   Filtros (so atuam na grade de projetos)
   ------------------------------------------------------------------------ */
function renderFilters(tags, projects) {
  const count = (k) => projects.filter((p) => p.tags.includes(k)).length;
  if (state.filter !== 'all' && !count(state.filter)) state.filter = 'all';
  const btn = (key, label, n) => `<button type="button" class="filter" data-filter="${key}" aria-pressed="${key === state.filter}">${esc(label)} <span class="filter-count">${n}</span></button>`;
  $('#filters').innerHTML = btn('all', t('filters.all'), projects.length) +
    Object.entries(tags).filter(([k]) => count(k) > 0).map(([k, label]) => btn(k, label, count(k))).join('');
}

function initFilters() {
  $('#filters').addEventListener('click', (e) => { const b = e.target.closest('.filter'); if (b) applyFilter(b.dataset.filter); });
  $('[data-filter-reset]').addEventListener('click', () => applyFilter('all'));
}

function applyFilter(key) {
  $$('.filter').forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === key));
  let visible = 0;
  $$('#proj-grid .card').forEach((c) => {
    const show = key === 'all' || c.dataset.tags.split(' ').includes(key);
    c.hidden = !show;
    if (show) visible++;
  });
  $('#proj-empty').hidden = visible > 0;
  state.filter = key;
  layoutMoreTile();
}

/* O quadro "Todos os repositorios" so aparece quando completa uma fileira
   (filtro "Todos" e grade com fileira incompleta); senao, vira link simples. */
function layoutMoreTile() {
  const grid = $('#proj-grid');
  const tile = $('#proj-more');
  if (!grid || !tile) return;
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
  const cards = $$('#proj-grid .card:not([hidden])').length;
  const show = state.filter === 'all' && cards > 0 && cards % cols !== 0;
  tile.hidden = !show;
  $('#proj-more-link').hidden = show || cards === 0;
}

/* ------------------------------------------------------------------------
   Painel (dialog nativo): galeria, video, texto e links
   ------------------------------------------------------------------------ */
function openProject(id, trigger, startIndex = 0) {
  const p = state.byId.get(id);
  const dlg = $('#pd');
  if (!p || !dlg) return;
  const consult = p.tipo === 'consultoria';
  state.dialog = { project: p, index: 0, trigger: trigger || state.dialog.trigger || document.activeElement, items: [] };
  if (p.midia.video) state.dialog.items.push({ type: 'video', src: V(p.midia.video), poster: V(p.midia.capa), legenda: t('pd.videoCaption') });
  (p.midia.galeria || []).forEach((g) => state.dialog.items.push({ type: 'img', src: V(g.src), mini: g.mini ? V(g.mini) : null, legenda: g.legenda }));

  $('#pd-local').textContent = consult ? `${t('consult.local')} · ${p.local}` : p.local;
  $('#pd-title').textContent = p.titulo;
  const entregas = consult && p.entregaveis?.length ? `<h3>${esc(t('pd.deliver'))}</h3><ul>${p.entregaveis.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
  $('#pd-text').innerHTML = p.descricao.map((x) => `<p>${esc(x)}</p>`).join('') + entregas +
    (p.destaques?.length ? `<h3>${esc(t('pd.highlights'))}</h3><ul>${p.destaques.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '');
  const m = $('#pd-metrics');
  m.className = 'pd-metrics metrics';
  m.innerHTML = metricsHtml(p.metricas);
  m.hidden = !p.metricas?.length;
  $('#pd-stack').innerHTML = (p.stack || []).map((s) => `<li>${esc(s)}</li>`).join('');
  $('#pd-links').innerHTML = consult
    ? `<a class="btn btn-primary" href="${esc(proposalHref(t('consult.subject', { t: p.titulo })))}">${esc(t('pd.proposal'))}</a>`
    : [
      p.links.demo ? `<a class="btn btn-primary" href="${esc(p.links.demo)}" target="_blank" rel="noopener">${esc(t('pd.demo'))}</a>` : '',
      p.links.codigo ? `<a class="btn btn-ghost" href="${esc(p.links.codigo)}" target="_blank" rel="noopener">${esc(t('pd.code'))}</a>` : '',
      p.links.extra ? `<a class="btn btn-ghost" href="${esc(p.links.extra.url)}" target="_blank" rel="noopener">${esc(p.links.extra.rotulo)}</a>` : '',
    ].join('');
  $('#pd-thumbs').innerHTML = state.dialog.items.map((it, i) => `
    <button type="button" class="pd-thumb" data-index="${i}" aria-label="${esc(t('pd.thumb', { n: i + 1, t: it.legenda }))}">
      <img src="${esc(it.type === 'video' ? (p.midia.capaMini ? V(p.midia.capaMini) : it.poster) : (it.mini || it.src))}" alt="" loading="lazy" />
      ${it.type === 'video' ? `<span class="pd-thumb-label">${esc(t('card.video'))}</span>` : ''}
    </button>`).join('');
  const many = state.dialog.items.length > 1;
  $('#pd-prev').hidden = !many; $('#pd-next').hidden = !many; $('#pd-thumbs').hidden = !many;

  showMedia(startIndex);
  if (!dlg.open) { dlg.showModal(); dlg.scrollTop = 0; }
  history.replaceState(null, '', `#projeto/${id}`);
}

function showMedia(i) {
  const items = state.dialog.items;
  if (!items.length) return;
  const idx = (i + items.length) % items.length;
  state.dialog.index = idx;
  const it = items[idx];
  const stage = $('#pd-media');
  const prev = $('video', stage); if (prev) prev.pause();
  stage.innerHTML = it.type === 'video'
    ? `<video src="${esc(it.src)}" poster="${esc(it.poster)}" ${reduceMotion.matches ? 'controls' : 'autoplay controls'} muted loop playsinline></video>`
    : `<img src="${esc(it.src)}" alt="${esc(it.legenda)}" />`;
  $('#pd-caption').innerHTML = `${esc(t('pd.of', { i: idx + 1, n: items.length }))} ${esc(it.legenda)}` +
    (it.type === 'img' ? ` <a class="pd-full" href="${esc(it.src)}" target="_blank" rel="noopener">${esc(t('pd.full'))}</a>` : '');
  $$('.pd-thumb').forEach((th, k) => th.setAttribute('aria-current', k === idx));
}

function closeProject() {
  const dlg = $('#pd');
  const v = $('#pd-media video'); if (v) v.pause();
  if (dlg.open) dlg.close();
}

function initDialog() {
  const dlg = $('#pd');
  $('#pd-close').addEventListener('click', closeProject);
  $('#pd-prev').addEventListener('click', () => showMedia(state.dialog.index - 1));
  $('#pd-next').addEventListener('click', () => showMedia(state.dialog.index + 1));
  $('#pd-thumbs').addEventListener('click', (e) => { const th = e.target.closest('.pd-thumb'); if (th) showMedia(+th.dataset.index); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeProject(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.target.closest('video')) return;
    if (e.key === 'ArrowRight') showMedia(state.dialog.index + 1);
    if (e.key === 'ArrowLeft') showMedia(state.dialog.index - 1);
  });
  dlg.addEventListener('close', () => {
    $('#pd-media').innerHTML = '';
    if (location.hash.startsWith('#projeto/')) history.replaceState(null, '', location.pathname + location.search);
    // Depois de trocar o idioma os cards sao recriados: devolve o foco ao card equivalente
    const tr = state.dialog.trigger;
    const id = state.dialog.project?.id;
    if (tr?.isConnected) tr.focus?.();
    else if (id) $(`.card-open[data-open="${CSS.escape(id)}"]`)?.focus();
    state.dialog.trigger = null;
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (b) openProject(b.dataset.open, b);
  });
}

/* ------------------------------------------------------------------------
   Consultorias (textos e imagens em data.json)
   ------------------------------------------------------------------------ */
function renderConsultorias(c) {
  if (!c || !c.itens?.length) { $('#consultorias').hidden = true; return; }
  const intro = $('#consult-intro');
  intro.textContent = c.intro;
  intro.classList.toggle('is-placeholder', isPlaceholder(c.intro));
  $('#consult-draft').hidden = !c.rascunho;
  c.itens.forEach((it) => { it.tipo = 'consultoria'; it.links = it.links || {}; state.byId.set(it.id, it); });
  $('#consult-grid').innerHTML = c.itens.map(cardHtml).join('');
  const cta = $('#consult-cta');
  cta.textContent = c.cta?.texto || t('consult.cta');
  cta.href = proposalHref(c.cta?.assunto);
}

/* ------------------------------------------------------------------------
   Camadas, trajeto, formacao e idiomas
   ------------------------------------------------------------------------ */
function renderCamadas(list) {
  $('#legend').innerHTML = list.map((l, i) => `
    <li>
      <svg class="legend-swatch" viewBox="0 0 20 20" aria-hidden="true"><polygon points="10,1 18,5.5 18,14.5 10,19 2,14.5 2,5.5" fill="${SWATCHES[i % SWATCHES.length]}" fill-opacity=".28" stroke="${SWATCHES[i % SWATCHES.length]}" stroke-width="1.3"/></svg>
      <span class="legend-name">${esc(l.nome)}</span>
      <ul class="chips">${l.itens.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </li>`).join('');
}

function renderTrajeto(exp, edu, langs) {
  $('#exp-list').innerHTML = exp.map((e) => `
    <li class="exp">
      <p class="exp-when">${esc(e.periodo)}<span>${esc(e.local)}</span></p>
      <div>
        <h3>${esc(e.cargo)}</h3>
        <p class="exp-org">${esc(e.organizacao)} ${e.vinculo ? `<span class="exp-tag">${esc(e.vinculo)}</span>` : ''}</p>
        <p>${esc(e.resumo)}</p>
      </div>
    </li>`).join('');
  $('#edu-list').innerHTML = edu.map((f) => `<li><strong>${esc(f.curso)}</strong><span>${esc(f.instituicao)}</span><small>${esc(f.periodo)}</small></li>`).join('');
  $('#lang-list').innerHTML = langs.map((l) => `<li>${esc(l.idioma)}<span>${esc(l.nivel)}</span></li>`).join('');
}

/* ------------------------------------------------------------------------
   Navegacao: menu movel e secao ativa
   ------------------------------------------------------------------------ */
function initNav() {
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });

  const links = $$('[data-nav]');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => (a.getAttribute('href') === `#${en.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

function initCopyEmail() {
  $('#copy-email').addEventListener('click', async () => {
    const email = state.data?.autor?.email || 'pedroschuldiner@outlook.com';
    try { await navigator.clipboard.writeText(email); toast(t('toast.copied')); }
    catch { toast(t('toast.manual', { e: email })); }
  });
}

function initLangSwitch() {
  $$('.lang-opt').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = a.dataset.lang;
    if (lang !== state.lang) setLang(lang, { persist: true });
  }));
}

/* ------------------------------------------------------------------------
   Render geral e troca de idioma
   ------------------------------------------------------------------------ */
function renderAll(data) {
  state.byId = new Map();
  data.projetos.forEach((p) => { p.tipo = 'projeto'; state.byId.set(p.id, p); });
  renderConsultorias(data.consultorias);
  renderLive(data.aoVivo || []);
  renderFilters(data.tags, data.projetos);
  renderProjects(data.projetos, data.autor.github);
  applyFilter(state.filter);
  initHoverPreview();
  renderCamadas(data.camadas || []);
  renderTrajeto(data.experiencia || [], data.formacao || [], data.idiomas || []);
  const cv = $('#cv-link');
  if (cv && data.autor.curriculo) cv.href = data.autor.curriculo;
}

async function setLang(lang, { persist = false } = {}) {
  state.lang = LANGS.includes(lang) ? lang : 'pt';
  applyStatic();
  if (persist) {
    savePref(state.lang);
    const u = new URL(location.href);
    u.searchParams.set('lang', state.lang);
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }
  const data = await getData(state.lang);
  state.data = data;
  renderAll(data);
  const dlg = $('#pd');
  if (dlg?.open && state.dialog.project) openProject(state.dialog.project.id, null, state.dialog.index);
}

/* ------------------------------------------------------------------------
   Inicializacao
   ------------------------------------------------------------------------ */
async function boot() {
  $('#year').textContent = new Date().getFullYear();
  initNav();
  initDialog();
  initLive();
  initFilters();
  initCopyEmail();
  initLangSwitch();
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layoutMoreTile, 120); });
  // Link #projeto/<id> colado na mesma aba tambem abre o painel
  window.addEventListener('hashchange', () => {
    const h = location.hash.match(/^#projeto\/(.+)$/);
    if (h && state.byId.has(h[1])) openProject(h[1]);
  });
  try {
    await setLang(detectLang());
    const m = location.hash.match(/^#projeto\/(.+)$/);
    if (m && state.byId.has(m[1])) openProject(m[1]);
  } catch (err) {
    console.error('[ERRO] falha ao carregar data.json:', err);
    $('#proj-grid').innerHTML = `<p class="loading">${esc(t('error.load'))}</p>`;
  }
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
