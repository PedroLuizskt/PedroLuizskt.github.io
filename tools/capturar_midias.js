// Recaptura capas, fotos de galeria e videos dos WebMaps publicados,
// agora com os mapas base reais (CARTO, OSM, ArcGIS) carregando normalmente.
//
// Uso (na raiz do portfolio):
//   npm install --no-save playwright
//   npx playwright install chromium
//   node tools/capturar_midias.js                 -> todos os mapas
//   node tools/capturar_midias.js enso-centro-oeste  -> apenas um
//   bash tools/converter_videos.sh                -> gera preview.mp4, demo.gif e cover-800.jpg
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, '..', 'assets', 'projects');
const VIEW = { width: 1280, height: 800 };

// Registra toda instancia L.Map criada na pagina em window.__maps
const HOOK = `(() => {
  window.__maps = []; let _L;
  Object.defineProperty(window, 'L', { configurable: true,
    get() { return _L; },
    set(v) { _L = v; try { v.Map.addInitHook(function () { window.__maps.push(this); }); } catch (e) {} } });
})();`;

const sleep = (pg, ms) => pg.waitForTimeout(ms);
const safeClick = (pg, sel) => pg.click(sel, { timeout: 2500 }).catch(() => {});
const clickText = async (pg, sel, text) => {
  const loc = pg.locator(sel, { hasText: text }).first();
  if (await loc.count()) await loc.click({ timeout: 2500 }).catch(() => {});
};
const setView = (pg, lat, lng, z) => pg.evaluate(([a, b, c]) => { const m = window.__maps[0]; if (m) m.setView([a, b], c, { animate: false }); }, [lat, lng, z]);
const flyTo = (pg, lat, lng, z) => pg.evaluate(([a, b, c]) => { const m = window.__maps[0]; if (m) m.flyTo([a, b], c, { duration: 1.6 }); }, [lat, lng, z]);
const fitData = (pg, pad = 30) => pg.evaluate((p) => {
  const m = window.__maps && window.__maps[0]; if (!m) return;
  let b = null;
  m.eachLayer((l) => { if (l.getBounds && l.getLayers && l.getLayers().length) { const lb = l.getBounds(); if (lb.isValid()) b = b ? b.extend(lb) : lb; } });
  if (b) m.fitBounds(b, { padding: [p, p], animate: false });
}, pad);

const SITES = [
  {
    id: 'florestas-publicas-brasil', url: 'https://pedroluizskt.github.io/florestas-publicas-brasil/', boot: 20000,
    async stills(pg, shot) {
      await safeClick(pg, '#btn-mun'); await sleep(pg, 2500);
      await setView(pg, -13.5, -52.5, 5); await sleep(pg, 2500); await shot('cover');
      await safeClick(pg, '#btn-fp'); await sleep(pg, 3500); await shot('g1');
      await clickText(pg, '.tab', 'RANKING'); await sleep(pg, 1500); await shot('g2');
      await clickText(pg, '.tab', 'HIST'); await sleep(pg, 1500); await shot('g3');
    },
    async clip(pg) {
      await setView(pg, -14, -53, 4); await sleep(pg, 1500);
      await safeClick(pg, '#btn-mun'); await sleep(pg, 1800);
      await flyTo(pg, -8.5, -58, 5); await sleep(pg, 2400);
      await safeClick(pg, '#btn-fp'); await sleep(pg, 2600);
      await clickText(pg, '.tab', 'RANKING'); await sleep(pg, 1800);
      await clickText(pg, '.tab', 'HIST'); await sleep(pg, 1800);
      await clickText(pg, '.tab', 'BIOMAS'); await sleep(pg, 1800);
    },
  },
  {
    id: 'enso-centro-oeste', url: 'https://pedroluizskt.github.io/enso-centro-oeste/', boot: 5000,
    async stills(pg, shot) {
      await fitData(pg, 18); await sleep(pg, 2000); await shot('cover');
      await safeClick(pg, '#mode-corr'); await sleep(pg, 1800); await shot('g1');
      await clickText(pg, '.tab', 'CORRELACAO'); await sleep(pg, 1500); await shot('g2');
      await clickText(pg, '.tab', 'COMPOSICAO'); await sleep(pg, 1500); await shot('g3');
    },
    async clip(pg) {
      await fitData(pg, 18); await sleep(pg, 1500);
      await pg.selectOption('#year-select', '2015').catch(() => {}); await sleep(pg, 1600);
      await pg.selectOption('#year-select', '2023').catch(() => {}); await sleep(pg, 1600);
      await safeClick(pg, '#mode-corr'); await sleep(pg, 2000);
      await clickText(pg, '.tab', 'CORRELACAO'); await sleep(pg, 1800);
      await clickText(pg, '.tab', 'COMPOSICAO'); await sleep(pg, 1800);
    },
  },
  {
    id: 'romaneio-digital-vimef', url: 'https://pedroluizskt.github.io/vimef-frontend/', boot: 4000,
    async stills(pg, shot) {
      await shot('cover');
      await pg.evaluate(() => window.scrollTo(0, 820)); await sleep(pg, 900); await shot('g1');
      await pg.evaluate(() => window.scrollTo(0, 0)); await sleep(pg, 400);
      await clickText(pg, '.tab-btn', 'Toras'); await sleep(pg, 1300); await shot('g2');
      await clickText(pg, '.tab-btn', 'Lenha'); await sleep(pg, 1300); await shot('g3');
    },
    async clip(pg) {
      await safeClick(pg, '.carousel-nav.next'); await sleep(pg, 1300);
      await safeClick(pg, '.carousel-nav.next'); await sleep(pg, 1300);
      await pg.mouse.wheel(0, 700); await sleep(pg, 1600);
      await pg.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(pg, 1100);
      await clickText(pg, '.tab-btn', 'Toras'); await sleep(pg, 1800);
      await clickText(pg, '.tab-btn', 'Lenha'); await sleep(pg, 1800);
    },
  },
  {
    id: 'agrodados', url: 'https://pedroluizskt.github.io/Agrodados-imersao-dev/', boot: 3000,
    async stills(pg, shot) {
      await shot('g1');
      await safeClick(pg, 'svg g[id="Minas Gerais"]'); await sleep(pg, 1600); await shot('cover');
    },
    async clip(pg) {
      await pg.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' })); await sleep(pg, 1000);
      for (const uf of ['Pará', 'Mato Grosso', 'Minas Gerais']) {
        const g = pg.locator(`svg g[id="${uf}"]`);
        if (await g.count()) { await g.hover(); await sleep(pg, 500); await g.click().catch(() => {}); await sleep(pg, 1500); await pg.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' })); await sleep(pg, 900); }
      }
    },
  },
];

(async () => {
  const only = process.argv[2];
  const browser = await chromium.launch();
  for (const s of SITES) {
    if (only && s.id !== only) continue;
    const dir = path.join(OUT, s.id); fs.mkdirSync(dir, { recursive: true });
    try {
      // Fotos: viewport 1280x800 com escala 1.25 = arquivos de 1600x1000 (16:10)
      const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1.25 });
      await ctx.addInitScript(HOOK);
      const pg = await ctx.newPage();
      await pg.goto(s.url, { waitUntil: 'load', timeout: 120000 });
      await sleep(pg, s.boot);
      const shot = (name) => pg.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 80 });
      await s.stills(pg, shot);
      await ctx.close();
      console.log(`[OK] fotos ${s.id}`);

      // Video: grava a interacao e anota a janela util para o corte
      const vctx = await browser.newContext({ viewport: VIEW, recordVideo: { dir, size: VIEW } });
      await vctx.addInitScript(HOOK);
      const t0 = Date.now();
      const vp = await vctx.newPage();
      await vp.goto(s.url, { waitUntil: 'load', timeout: 120000 });
      await sleep(vp, s.boot);
      const start = (Date.now() - t0) / 1000;
      await s.clip(vp);
      const end = (Date.now() - t0) / 1000;
      const video = vp.video();
      await vctx.close();
      fs.renameSync(await video.path(), path.join(dir, 'raw.webm'));
      fs.writeFileSync(path.join(dir, 'clip.json'), JSON.stringify({ start, end }));
      console.log(`[OK] video ${s.id} (${start.toFixed(1)}s a ${end.toFixed(1)}s)`);
    } catch (e) {
      console.log(`[ERRO] ${s.id}: ${e.message.split('\n')[0]}`);
    }
  }
  await browser.close();
  console.log('[OK] concluido. Rode agora: bash tools/converter_videos.sh');
})();
