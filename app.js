/* =========================================================================
   PORTFOLIO PEDRO LUIZ R. VAZ DE MELO - V6.1
   Todo o conteudo vem de data.json. Este arquivo renderiza e liga os
   comportamentos: mapas ao vivo, filtros, cards de projetos e de
   consultorias, painel com galeria, previa em video, navegacao e e-mail.
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

const state = { data: null, byId: new Map(), filter: 'all', dialog: { project: null, items: [], index: 0, trigger: null } };

/* Versao das midias (campo "versao" do data.json): entra na URL de cada imagem e video.
   Ao trocar arquivos mantendo o nome, suba a versao e o navegador busca tudo de novo. */
const V = (u) => (u ? `${u}${u.includes('?') ? '&' : '?'}v=${encodeURIComponent(state.data?.versao || '1')}` : u);

/* ------------------------------------------------------------------------
   Utilitarios
   ------------------------------------------------------------------------ */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2400);
}

const metricsHtml = (list = []) => list.slice(0, 3)
  .map((m) => `<div><dt>${esc(m.rotulo)}</dt><dd title="${esc(m.valor)}">${esc(m.valor)}</dd></div>`).join('');

function proposalHref(assunto) {
  const d = state.data;
  const subject = assunto || d?.consultorias?.cta?.assunto || 'Consultoria';
  return `mailto:${d.autor.email}?subject=${encodeURIComponent(subject)}`;
}

/* ------------------------------------------------------------------------
   Mapas ao vivo
   ------------------------------------------------------------------------ */
function renderLive(items) {
  const tabs = $('#live-tabs');
  if (!items.length) { $('#mapas').hidden = true; return; }
  tabs.innerHTML = items.map((it, i) => `
    <button type="button" class="live-tab" role="tab" id="live-tab-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-index="${i}">${esc(it.rotulo)}</button>`).join('');

  const select = (i, focus = false) => {
    const it = items[i];
    const p = state.byId.get(it.projeto);
    $$('.live-tab', tabs).forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    if (focus) $(`#live-tab-${i}`).focus();
    const frame = $('#live-frame');
    frame.classList.remove('is-loaded');
    $('iframe', frame)?.remove();
    const poster = $('#live-poster');
    poster.src = p ? V(p.midia.capa) : '';
    poster.alt = p ? `Prévia do mapa ${p.titulo}` : '';
    $('#live-warn').textContent = it.aviso || '';
    $('#live-desc').textContent = p ? p.resumo : '';
    $('#live-open').href = it.url;
    $('#live-load').onclick = () => {
      const f = document.createElement('iframe');
      f.src = it.url;
      f.title = `Mapa interativo: ${p ? p.titulo : it.rotulo}`;
      f.loading = 'lazy';
      f.allow = 'fullscreen';
      frame.appendChild(f);
      frame.classList.add('is-loaded');
    };
    $('#live-details').onclick = (e) => p && openProject(p.id, e.currentTarget);
    frame.setAttribute('aria-labelledby', `live-tab-${i}`);
  };

  tabs.addEventListener('click', (e) => { const b = e.target.closest('.live-tab'); if (b) select(+b.dataset.index); });
  tabs.addEventListener('keydown', (e) => {
    const cur = $$('.live-tab', tabs).findIndex((b) => b.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight') { e.preventDefault(); select((cur + 1) % items.length, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); select((cur - 1 + items.length) % items.length, true); }
  });
  select(0);
}

/* ------------------------------------------------------------------------
   Cards: mesma estrutura de 5 linhas para projetos e consultorias
   (capa, cabecalho, resumo, metricas ou entregas, acoes)
   ------------------------------------------------------------------------ */
function cardHtml(p) {
  const consult = p.tipo === 'consultoria';
  const hasDemo = !!p.links?.demo;
  const links = consult
    ? `<a href="${esc(proposalHref(`Consultoria: ${p.titulo}`))}">Pedir proposta</a>`
    : [
      p.links.codigo ? `<a href="${esc(p.links.codigo)}" target="_blank" rel="noopener">Código ${ICON_EXT}</a>` : '',
      hasDemo ? `<a href="${esc(p.links.demo)}" target="_blank" rel="noopener">Demo ${ICON_EXT}</a>` : '',
    ].join('');
  const row4 = consult
    ? `<ul class="card-list">${p.entregaveis.map((e) => `<li${isPlaceholder(e) ? ' class="is-placeholder"' : ''}>${esc(e)}</li>`).join('')}</ul>`
    : `<dl class="metrics">${metricsHtml(p.metricas)}</dl>`;
  const accent = consult ? 'consult' : p.tags[0];
  const alt = p.midia.galeria?.[0]?.legenda || p.titulo;
  return `
    <article class="card" data-id="${esc(p.id)}" data-accent="${esc(accent)}" data-tags="${esc((p.tags || []).join(' '))}">
      <div class="card-media">
        <img src="${esc(V(p.midia.capaMini || p.midia.capa))}" srcset="${esc(V(p.midia.capaMini))} 800w, ${esc(V(p.midia.capa))} 1600w"
             sizes="(max-width: 760px) 100vw, 400px" alt="${esc(alt)}" loading="lazy" decoding="async" width="800" height="500" />
        ${hasDemo ? '<span class="card-badge">Demo ao vivo</span>' : ''}
        ${consult ? `<span class="card-badge card-badge-consult">${p.midia.galeria.length} ${p.midia.galeria.length > 1 ? 'imagens' : 'imagem'}</span>` : ''}
        ${p.midia.video ? '<span class="card-play" aria-hidden="true">Vídeo</span>' : ''}
      </div>
      <div class="card-head">
        <p class="card-local">${esc(p.local)}</p>
        <h3 class="card-title"><button type="button" class="card-open" data-open="${esc(p.id)}">${esc(p.titulo)}</button></h3>
      </div>
      <p class="card-summary">${esc(p.resumo)}</p>
      ${row4}
      <div class="card-actions">
        ${links}
        <button type="button" class="card-details" data-open="${esc(p.id)}" aria-label="Ver detalhes de ${esc(p.titulo)}">Detalhes</button>
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
        <span class="card-more-title">Todos os repositórios</span>
        <span class="card-more-text">Pacotes, estudos e notebooks que não couberam nesta seleção.</span>
        <span class="card-more-cta">Abrir no GitHub ${ICON_EXT}</span>
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
  const count = (t) => projects.filter((p) => p.tags.includes(t)).length;
  const btn = (key, label, n) => `<button type="button" class="filter" data-filter="${key}" aria-pressed="${key === 'all'}">${esc(label)} <span class="filter-count">${n}</span></button>`;
  $('#filters').innerHTML = btn('all', 'Todos', projects.length) +
    Object.entries(tags).filter(([k]) => count(k) > 0).map(([k, label]) => btn(k, label, count(k))).join('');
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
function openProject(id, trigger) {
  const p = state.byId.get(id);
  const dlg = $('#pd');
  if (!p || !dlg) return;
  const consult = p.tipo === 'consultoria';
  state.dialog = { project: p, index: 0, trigger: trigger || document.activeElement, items: [] };
  if (p.midia.video) state.dialog.items.push({ type: 'video', src: V(p.midia.video), poster: V(p.midia.capa), legenda: 'Em movimento: gravação da interface' });
  (p.midia.galeria || []).forEach((g) => state.dialog.items.push({ type: 'img', src: V(g.src), mini: g.mini ? V(g.mini) : null, legenda: g.legenda }));

  $('#pd-local').textContent = consult ? `Consultoria · ${p.local}` : p.local;
  $('#pd-title').textContent = p.titulo;
  const entregas = consult && p.entregaveis?.length ? `<h3>O que é entregue</h3><ul>${p.entregaveis.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
  $('#pd-text').innerHTML = p.descricao.map((t) => `<p>${esc(t)}</p>`).join('') + entregas +
    (p.destaques?.length ? `<h3>Destaques</h3><ul>${p.destaques.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '');
  const m = $('#pd-metrics');
  m.className = 'pd-metrics metrics';
  m.innerHTML = metricsHtml(p.metricas);
  m.hidden = !p.metricas?.length;
  $('#pd-stack').innerHTML = (p.stack || []).map((s) => `<li>${esc(s)}</li>`).join('');
  $('#pd-links').innerHTML = consult
    ? `<a class="btn btn-primary" href="${esc(proposalHref(`Consultoria: ${p.titulo}`))}">Pedir uma proposta</a>`
    : [
      p.links.demo ? `<a class="btn btn-primary" href="${esc(p.links.demo)}" target="_blank" rel="noopener">Abrir a demo</a>` : '',
      p.links.codigo ? `<a class="btn btn-ghost" href="${esc(p.links.codigo)}" target="_blank" rel="noopener">Ver o código no GitHub</a>` : '',
      p.links.extra ? `<a class="btn btn-ghost" href="${esc(p.links.extra.url)}" target="_blank" rel="noopener">${esc(p.links.extra.rotulo)}</a>` : '',
    ].join('');
  $('#pd-thumbs').innerHTML = state.dialog.items.map((it, i) => `
    <button type="button" class="pd-thumb" data-index="${i}" aria-label="Mostrar mídia ${i + 1}: ${esc(it.legenda)}">
      <img src="${esc(it.type === 'video' ? (p.midia.capaMini ? V(p.midia.capaMini) : it.poster) : (it.mini || it.src))}" alt="" loading="lazy" />
      ${it.type === 'video' ? '<span class="pd-thumb-label">Vídeo</span>' : ''}
    </button>`).join('');
  const many = state.dialog.items.length > 1;
  $('#pd-prev').hidden = !many; $('#pd-next').hidden = !many; $('#pd-thumbs').hidden = !many;

  showMedia(0);
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
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
  $('#pd-caption').innerHTML = `${idx + 1} de ${items.length}. ${esc(it.legenda)}` +
    (it.type === 'img' ? ` <a class="pd-full" href="${esc(it.src)}" target="_blank" rel="noopener">Abrir em tamanho real</a>` : '');
  $$('.pd-thumb').forEach((t, k) => t.setAttribute('aria-current', k === idx));
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
  $('#pd-thumbs').addEventListener('click', (e) => { const t = e.target.closest('.pd-thumb'); if (t) showMedia(+t.dataset.index); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeProject(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.target.closest('video')) return;
    if (e.key === 'ArrowRight') showMedia(state.dialog.index + 1);
    if (e.key === 'ArrowLeft') showMedia(state.dialog.index - 1);
  });
  dlg.addEventListener('close', () => {
    $('#pd-media').innerHTML = '';
    if (location.hash.startsWith('#projeto/')) history.replaceState(null, '', location.pathname + location.search);
    state.dialog.trigger?.focus?.();
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
  cta.textContent = c.cta?.texto || 'Pedir uma proposta';
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
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
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

function initCopyEmail(email) {
  $('#copy-email').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(email); toast('E-mail copiado.'); }
    catch { toast(`Copie manualmente: ${email}`); }
  });
}

/* ------------------------------------------------------------------------
   Inicializacao
   ------------------------------------------------------------------------ */
async function boot() {
  $('#year').textContent = new Date().getFullYear();
  initNav();
  initDialog();
  try {
    const res = await fetch('data.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.data = data;
    data.projetos.forEach((p) => { p.tipo = 'projeto'; state.byId.set(p.id, p); });
    renderLive(data.aoVivo || []);
    renderFilters(data.tags, data.projetos);
    renderProjects(data.projetos, data.autor.github);
    layoutMoreTile();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layoutMoreTile, 120); });
    renderConsultorias(data.consultorias);
    initHoverPreview();
    renderCamadas(data.camadas || []);
    renderTrajeto(data.experiencia || [], data.formacao || [], data.idiomas || []);
    initCopyEmail(data.autor.email);
    const m = location.hash.match(/^#projeto\/(.+)$/);
    if (m && state.byId.has(m[1])) openProject(m[1]);
  } catch (err) {
    console.error('[ERRO] falha ao carregar data.json:', err);
    $('#proj-grid').innerHTML = '<p class="loading">Os projetos não carregaram. Abra o site por um servidor HTTP (veja o guia, seção 1) e recarregue.</p>';
  }
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
