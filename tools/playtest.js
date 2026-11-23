// Bölümleri kare kare oynatan otomatik oyuncu.
// Kullanım: node tools/playtest.js tools/solutions.js [bölüm anahtarı ...]   (ör. l25 f2; arşivdeki bölümler atlanır)   (Playwright gerekir; V=1 adım adım döküm verir)
// Program adımları: [op, arg]
//   R/L/W n        n tick sağa / sola / bekle        RJ/LJ/J n   zıplamayı n tick basılı tut
//   R> x / L< x    merkez x karesini geçene kadar    RJ> x / LJ< x  zıplayarak (havada) x'e kadar
//   G              yere inene kadar bekle            RG / LG     yön tuşuyla yere inene kadar
//   T n            dünya saati n olana kadar bekle   T% [m, a]   saat mod m == a olana kadar
//   CEIL           tavana inene kadar (ters yerçekimi)
//   D / RD / LD / RJD n   (taş bölümleri) bilerek öl: verilen tuşlarla ölene kadar devam et, sonra yeniden doğmayı bekle
const nodeMode = process.env.ZT_NODE === '1';
const chromium = nodeMode ? null : require('playwright').chromium;
const path = require('path');
const programs = require(path.resolve(process.argv[2]));
const only = process.argv.slice(3);
(async () => {
  const b = nodeMode ? null : await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = nodeMode ? require('./node-env')() : await b.newPage({ viewport: { width: 1280, height: 720 } });
  if (!nodeMode) {
    p.on('pageerror', (e) => console.log('PAGE ERROR', String(e)));
    await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?zttest');
    await p.waitForTimeout(300);
  }
  let fail = 0;
  const keys = await p.evaluate(() => window.ZT.LEVEL_KEYS);
  for (const [num, prog] of Object.entries(programs)) {
    if (only.length && !only.includes(num)) continue;
    const idx = keys.indexOf(num);
    if (idx < 0) { console.log('SKIP ' + num + ' (arşivde)'); continue; }
    const res = await p.evaluate(({ idx, prog }) => {
      const D = window.ZT.debug;
      D.load(idx);
      const log = [];
      const st = () => D.state();
      const snap = (label) => { const s = st(); log.push(label + ' → x=' + s.x.toFixed(2) + ' y=' + s.y.toFixed(2) + ' t=' + s.t + (s.ground ? ' G' : '') + (s.cp ? ' cp' + s.cp : '')); };
      let deaths = 0;
      const done = () => st().level !== idx || st().screen === 'end';
      const tick = (l, r, j) => {
        D.tick(l, r, j);
        const s = st();
        if (s.deaths > deaths) { deaths = s.deaths; log.push('  ✕ DIED ' + s.lastDeath + ' at x=' + s.x.toFixed(2) + ' y=' + s.y.toFixed(2)); return 'dead'; }
        return done() ? 'done' : null;
      };
      for (let i = 0; i < prog.length; i++) {
        const [op, arg] = prog[i];
        const l = op[0] === 'L', r = op[0] === 'R', j = op.includes('J');
        let out = null, n = 0;
        const loop = (cond, max, ll, rr, jj) => { while (!cond() && n++ < (max || 900)) { out = tick(ll, rr, jj); if (out) break; } };
        if (op === 'D' || op === 'RD' || op === 'LD' || op === 'RJD' || op === 'LJD') {
          // Beklenen ölüm: ölene kadar tuşları tut, sonra yeniden doğmayı bekle
          let died = false;
          while (n++ < (arg || 600)) {
            D.tick(l, r, j);
            const s2 = st();
            if (s2.deaths > deaths) { deaths = s2.deaths; died = true; log.push('  ✝ (planned) ' + s2.lastDeath + ' at x=' + s2.x.toFixed(2)); break; }
            if (done()) return { ok: true, log };
          }
          if (!died) return { ok: false, log, why: 'expected death at step ' + i + ' did not happen' };
          let k = 0;
          while (st().dead && k++ < 200) D.tick(false, false, false);
          snap(i + ' ' + op);
          continue;
        }
        if (op === 'G' || op === 'RG' || op === 'LG') loop(() => st().ground, 400, l, r, false);
        else if (op === 'T') loop(() => st().t >= arg, 2000, false, false, false);
        else if (op === 'T%') loop(() => st().t % arg[0] === arg[1], 2000, false, false, false);
        else if (op.endsWith('>')) loop(() => st().x >= arg, 900, l, r, j);
        else if (op.endsWith('<')) loop(() => st().x <= arg, 900, l, r, j);
        else for (let k = 0; k < arg; k++) { out = tick(l, r, j); if (out) break; }
        snap(i + ' ' + op + ' ' + JSON.stringify(arg === undefined ? '' : arg));
        if (out === 'dead') return { ok: false, log, why: 'died' };
        if (out === 'done') return { ok: true, log };
        if (n >= 900 && op !== 'T' && op !== 'T%') return { ok: false, log, why: 'stuck at step ' + i };
      }
      for (let k = 0; k < 60; k++) if (tick(false, false, false) === 'done') return { ok: true, log };
      return { ok: false, log, why: 'program ended without reaching the door' };
    }, { idx, prog });
    console.log((res.ok ? 'PASS' : 'FAIL') + ' ' + num + ' (#' + (idx + 1) + ')' + (res.why ? ' (' + res.why + ')' : ''));
    if (!res.ok || process.env.V) console.log(res.log.slice(res.ok ? 0 : -8).join('\n'));
    if (!res.ok) fail++;
  }
  if (b) await b.close();
  process.exit(fail ? 1 : 0);
})();

