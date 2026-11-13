/* Zero Trust — oyun motoru, çizim ve arayüz akışı */
(function () {
  'use strict';

  const ZT = window.ZT;
  const t = ZT.t;
  const $ = (id) => document.getElementById(id);

  // ───────────────────────── Sadece PC ─────────────────────────
  function isPhoneOrTablet() {
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return true;
    // iPadOS kendini Mac olarak tanıtıyor: dokunmatik + hassas işaretçi yoksa tablettir.
    const coarseOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches;
    return navigator.maxTouchPoints > 1 && coarseOnly;
  }

  ZT.applyDom();
  ZT.onLang(() => ZT.applyDom());

  if (isPhoneOrTablet()) {
    $('app').remove();
    $('mobileBlock').hidden = false;
    return;
  }

  // ───────────────────────── Sabitler ─────────────────────────
  const W = 1920;
  const H = 1080;
  const T = 60;
  const COLS = ZT.COLS;
  const ROWS = ZT.ROWS;
  const N = ZT.LEVEL_COUNT;
  const STEP = 1000 / 60;      // fizik her zaman 60 tick/sn

  const PW = 40;               // oyuncu genişliği
  const PH = 48;               // oyuncu yüksekliği
  const BIG_W = 120;           // dev küpten sonra (3 kat)
  const BIG_H = 144;
  const MAXV = 7.5;            // azami koşu hızı
  const BIG_MAXV = 6;
  const ACC_G = 1.25;          // yerde ivme
  const ACC_A = 0.9;           // havada ivme
  const FRIC_G = 1.6;          // yerde sürtünme
  const FRIC_A = 0.25;         // havada sürtünme
  const G = 0.9;               // yerçekimi
  const JUMP = 16.2;           // zıplama hızı (≈2.4 kare)
  const BIG_JUMP = 13.5;
  const CUT = -5.5;            // tuş bırakılınca kesilen hız (alçak zıplama)
  const MAXFALL = 18;
  const SPRING = 26;           // yay fırlatma hızı (≈6 kare)
  const COYOTE = 6;            // kenardan düştükten sonra zıplama payı (tick)
  const BUFFER = 7;            // yere değmeden önce basılan zıplamayı hatırlama (tick)
  const CRUMBLE_T = 16;        // çöken karenin titreme süresi (tick)
  const EXIT_T = 22;           // kapıya giriş animasyonu (tick)
  const TRANS_T = 26;          // bölüm geçiş perdesi (tick)

  const C = {
    bg: '#0a0a0c',
    dot: 'rgba(236, 232, 223, 0.05)',
    plat: '#141418',
    platSide: '#2a2930',
    edge: '#ece8df',
    ink: '#ece8df',
    dim: '#7b7984',
    accent: '#c8ff3d',
    danger: '#ff3d3d',
    amber: '#ffb13d',
    gold: '#ffcc4d',
    purple: '#a78bfa'
  };
  const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';
  const FONT_DISPLAY = '"Space Grotesk", system-ui, sans-serif';

  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');

  // ───────────────────────── Kayıt ─────────────────────────
  const SAVE_KEY = 'zt.save.v3';
  function defaults() {
    return {
      unlocked: 0, cleared: Array(N).fill(false), deaths: 0,
      muted: false, music: true, radar: false,
      best: Array(N).fill(null), ldeaths: Array(N).fill(0)
    };
  }
  function fit(arr, fill) {
    const out = Array(N).fill(fill);
    if (Array.isArray(arr)) for (let i = 0; i < Math.min(N, arr.length); i++) out[i] = arr[i];
    return out;
  }
  function loadSave() {
    try {
      let raw = localStorage.getItem(SAVE_KEY);
      const migrating = !raw;
      if (!raw) raw = localStorage.getItem('zt.save.v2'); // eski 8 bölümlük kayıt
      if (raw) {
        const s = Object.assign(defaults(), JSON.parse(raw));
        s.cleared = fit(s.cleared, false);
        s.best = fit(s.best, null);
        s.ldeaths = fit(s.ldeaths, 0);
        s.unlocked = Math.max(0, Math.min(N - 1, s.unlocked | 0));
        if (migrating && s.cleared[7]) s.unlocked = Math.max(s.unlocked, 8);
        return s;
      }
    } catch (e) {}
    return defaults();
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }
  let save = loadSave();
  ZT.audio.muted = save.muted;
  ZT.audio.setMusic(save.music);

  // ───────────────────────── Durum ─────────────────────────
  let screen = 'menu';            // menu | levels | settings | playing | paused | end
  let settingsReturn = 'menu';
  let levelsReturn = 'menu';
  let levelIdx = 0;
  let world = null;
  let levelDeaths = 0;
  let levelTicks = 0;
  let respawnTimer = 0;
  let tick = 0;
  let particles = [];
  let ghosts = [];                // bu bölümdeki ölüm noktaları
  let shakeAmt = 0;
  let freeze = 0;                 // ölüm anındaki kısa donma
  let transT = 0;                 // bölüm geçiş perdesi
  let revengeTold = false;
  let rings = [];                 // ölüm / iniş şok dalgaları
  let trail = [];                 // hızlı hareket izi
  let demoRun = 0;                // menüdeki demonun kaçıncı denemesi
  let chapterSel = 0;             // bölüm seçiminde açık perde

  const keys = { left: false, right: false, jump: false };
  let jumpPrev = false;

  const player = {
    x: 0, y: 0, vx: 0, vy: 0, w: PW, h: PH, big: false, grav: 1,
    onGround: false, coyote: 0, buffer: 0, jumping: false, ride: null,
    dead: false, facing: 1, squash: 1, blink: 0, look: { x: 0, y: 0, t: 0 }
  };

  // ───────────────────────── Yardımcılar ─────────────────────────
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const pad2 = (n) => String(n).padStart(2, '0');
  const WALL = { k: '#' };
  const EMPTY = { k: '.' };

  function fmtTime(ticks) {
    if (ticks == null) return '–';
    const s = ticks / 60;
    const m = Math.floor(s / 60);
    return m + ':' + (s % 60).toFixed(1).padStart(4, '0');
  }

  function spawnParticles(x, y, color, count, power) {
    const p = power || 12;
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * p,
        vy: (Math.random() - 0.5) * p - 2,
        size: 4 + Math.random() * 6,
        color, grav: 0.35,
        life: 26 + Math.random() * 18, max: 44
      });
    }
  }

  function dust(x, y, count, dir) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 16, y: y - 2,
        vx: (dir || (Math.random() - 0.5)) * (0.5 + Math.random() * 1.5),
        vy: -0.3 - Math.random() * 0.8,
        size: 3 + Math.random() * 4,
        color: 'rgba(236,232,223,0.35)', grav: 0.02,
        life: 14 + Math.random() * 10, max: 24
      });
    }
  }

  // Yakında bir tuzak tetiklenince karakter o tarafa bakar
  function alertLook(x, y) {
    const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
    if (Math.hypot(x - cx, y - cy) < 800) player.look = { x, y, t: 50 };
  }

  // ───────────────────────── Dünya ─────────────────────────
  function measureHudTitle() {
    ctx.save();
    ctx.font = '700 22px ' + FONT_DISPLAY;
    const w = ctx.measureText(t(ZT.LEVEL_KEYS[levelIdx] + '.title')).width;
    ctx.restore();
    return Math.ceil(44 + 14 + w + 6);
  }

  function buildWorld(idx) {
    const L = ZT.buildLevel(idx);
    const cells = L.chars.map((row) => row.map((k) => ({ k, st: 0, t: 0, oy: 0, vy: 0, rev: false, trap: false, open: false, ot: 0, anim: 0, mask: false, broken: false })));
    const ents = JSON.parse(JSON.stringify(L.ents)).map((e) => {
      e.fired = false;
      switch (e.t) {
        case 'trapdoor':
          for (let j = e.y; j < e.y + e.h; j++) for (let i = e.x; i < e.x + e.w; i++) cells[j][i].trap = true;
          break;
        case 'pop': e.p = 0; break;
        case 'drop': e.px = e.x * T; e.py = e.y * T; e.vy = 0; e.state = 0; break;
        case 'slide': e.px = e.x * T; e.returned = false; break;
        case 'chase': e.el = 0; e.next = e.x0; break;
        case 'key': e.px = e.ox = (e.x + 0.5) * T; e.py = e.oy = (e.y + 0.5) * T; e.state = 0; e.timer = 0; e.growl = 0; break;
        case 'shy': e.px = e.x * T; e.py = e.y * T; e.pw = e.w * T; e.ph = 24; e.tx = e.px; break;
        case 'ceil': e.by = e.bottom * T; e.best = -1; e.idle = 0; e.state = 0; break;
        case 'cube': e.taken = false; break;
        case 'hud': e.px = 30; e.py = 26; e.pw = 0; e.ph = 34; e.vy = 0; e.state = 0; break;
        case 'clone': e.on = false; break;
        case 'window': e.px = e.x * T; e.py = e.y * T; e.pw = e.w * T; e.ph = e.h * T; e.state = 0; e.anim = 0; break;
        case 'decoy': e.px = e.x * T; e.py = (e.y - 1) * T; e.ate = 0; break;
      }
      return e;
    });
    // Tuzak tetiklenene kadar altındaki çukur dolu zemin gibi görünsün
    const maskBelow = (x, y) => {
      const list = [];
      for (let j = y + 1; j < ROWS; j++) {
        const c = cells[j][x];
        if (c.k === '#' && !c.trap) break;
        c.mask = true;
        list.push([x, j]);
      }
      return list;
    };
    for (const e of ents) {
      if (e.t !== 'trapdoor') continue;
      e.masked = [];
      for (let i = e.x; i < e.x + e.w; i++) e.masked.push(...maskBelow(i, e.y + e.h - 1));
    }
    // Sadece zemindeki sahte karelerin altı gizlenir (tavandaki sahte karelerin değil)
    for (let y = 9; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        if (cells[y][x].k === '~') cells[y][x].masked = maskBelow(x, y);

    const d = L.door;
    const door = {
      px: d.x * T, py: (d.y - 1) * T,
      runs: d.runs || [], runIdx: 0, runR: d.runR || 2.3, cooldown: 0,
      fakeWin: d.fakeWin || null, faked: false, jokeTimer: 0,
      locked: !!d.locked, lockMsg: 0
    };
    // Hayalet intikamı: önceki ölüm noktaların bu denemede tuzak olur
    const sx = (L.spawn[0] + 0.5) * T, sy = (L.spawn[1] + 0.5) * T;
    const dx = (d.x + 0.5) * T, dy = d.y * T;
    for (const e of ents) {
      if (e.t !== 'revenge') continue;
      e.pts = ghosts
        .filter((g) => Math.hypot(g.x - sx, g.y - sy) > 150 && Math.hypot(g.x - dx, g.y - dy) > 150 && g.y < ROWS * T)
        .slice(-e.max)
        .map((g) => ({ x: g.x, y: g.y }));
    }
    return { key: L.key, idx, cells, ents, door, spawn: L.spawn, inverted: false, t: 0, exiting: 0, hist: [], armT: -1, secretOpen: false };
  }

  function cellAt(tx, ty) {
    if (tx < 0 || tx >= COLS) return WALL;
    if (ty < 0 || ty >= ROWS) return EMPTY;
    return world.cells[ty][tx];
  }

  function isSolid(c) {
    switch (c.k) {
      case '#': return !(c.trap && c.open);
      case '=': return c.st < 2;
      case 'w': return c.st < 2;
      case '?': return c.rev;
      default: return false;
    }
  }

  function looksSolid(c) {
    return c.mask || (c.k === '#' && !(c.trap && c.open)) || (c.k === '~' && !c.broken) || (c.k === 'c' && !(world && world.secretOpen));
  }

  function unmask(list) {
    for (const [x, y] of list) world.cells[y][x].mask = false;
  }

  function forTiles(x, y, w, h, fn) {
    const tx0 = Math.floor(x / T), tx1 = Math.floor((x + w - 0.001) / T);
    const ty0 = Math.floor(y / T), ty1 = Math.floor((y + h - 0.001) / T);
    for (let ty = ty0; ty <= ty1; ty++)
      for (let tx = tx0; tx <= tx1; tx++) fn(cellAt(tx, ty), tx, ty);
  }

  function solidsIn(x, y, w, h) {
    const out = [];
    const box = { x, y, w, h };
    forTiles(x, y, w, h, (c, tx, ty) => { if (isSolid(c)) out.push({ x: tx * T, y: ty * T, w: T, h: T, c }); });
    for (const e of world.ents) {
      let r = null;
      if (e.t === 'drop' && e.state === 2) r = { x: e.px, y: e.py, w: e.w * T, h: e.h * T };
      else if (e.t === 'shy') r = { x: e.px, y: e.py, w: e.pw, h: e.ph };
      else if (e.t === 'hud' && e.state === 2) r = { x: e.px, y: e.py, w: e.pw, h: e.ph };
      else if (e.t === 'window' && e.state === 2) r = { x: e.px, y: e.py, w: e.pw, h: e.ph };
      if (r && overlap(r, box)) { r.c = null; r.ent = e; out.push(r); }
    }
    return out;
  }

  function landedOn(e, x0, w) {
    const bottom = e.py + e.ph;
    const ty = Math.floor((bottom - 0.01) / T);
    const tx0 = Math.floor(x0 / T), tx1 = Math.floor((x0 + w - 1) / T);
    for (let tx = tx0; tx <= tx1; tx++) if (isSolid(cellAt(tx, ty))) return ty * T;
    return null;
  }

  function inTrig(tr) {
    if (player.dead) return false;
    const cx = (player.x + player.w / 2) / T;
    const cy = (player.y + player.h / 2) / T;
    if (tr.length === 2) return cx >= tr[0] && cx < tr[0] + tr[1];
    return cx >= tr[0] && cx < tr[0] + tr[2] && cy >= tr[1] && cy < tr[1] + tr[3];
  }

  function hurtbox() {
    const ix = player.big ? 14 : 6;
    return { x: player.x + ix, y: player.y + ix, w: player.w - ix * 2, h: player.h - ix - 2 };
  }

  // ───────────────────────── Bildirimler ─────────────────────────
  const toastEl = $('toast');
  const toastMain = $('toastMain');
  const toastSub = $('toastSub');
  let toastTimer = null;

  function toast(main, kind, sub) {
    if (screen === 'menu') return;   // demo sessizdir
    toastMain.textContent = main;
    toastSub.textContent = sub || '';
    toastSub.hidden = !sub;
    toastEl.className = 'toast ' + (kind || 'info');
    void toastEl.offsetWidth;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), sub ? 2400 : 1700);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.classList.remove('on');
  }

  const introEl = $('intro');
  let introTimer = null;
  function showIntro() {
    $('introNum').textContent = t('levels.level') + ' ' + pad2(levelIdx + 1);
    $('introTitle').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.title');
    const ch = ZT.CHAPTERS[ZT.chapterOf(levelIdx)];
    $('introCh').textContent = t(ch.key + '.name') + ' · ' + t(ch.key + '.title');
    introEl.classList.remove('on');
    void introEl.offsetWidth;
    introEl.classList.add('on');
    clearTimeout(introTimer);
    introTimer = setTimeout(() => introEl.classList.remove('on'), 1700);
  }

  function flash() {
    const el = $('flash');
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
    canvas.classList.remove('shake');
    void canvas.offsetWidth;
    canvas.classList.add('shake');
  }

  // ───────────────────────── HUD ─────────────────────────
  function updateHud() {
    $('hudNum').textContent = pad2(levelIdx + 1);
    $('hudTitle').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.title');
    $('hudDeaths').textContent = String(save.deaths);
    $('hudLDeaths').textContent = String(levelDeaths);
    $('hudBest').textContent = fmtTime(save.best[levelIdx]);
    $('hudRadar').hidden = !save.radar;
    $('hudTime').textContent = fmtTime(levelTicks);
    $('hintText').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.hint');
    $('hud').classList.toggle('fake-title', !!(world && world.ents.some((e) => e.t === 'hud')));
    updateHint();
  }

  function updateHint() {
    $('hint').classList.toggle('on', levelDeaths >= 3 || levelTicks > 1800);
  }

  // ───────────────────────── Bölüm yönetimi ─────────────────────────
  function resetPlayer() {
    Object.assign(player, {
      w: PW, h: PH, big: false, grav: 1,
      x: world.spawn[0] * T + (T - PW) / 2,
      y: (world.spawn[1] + 1) * T - PH,
      vx: 0, vy: 0, onGround: true, coyote: 0, buffer: 0, jumping: false, ride: null,
      dead: false, facing: world.spawn[0] > COLS / 2 ? -1 : 1, squash: 1, look: { x: 0, y: 0, t: 0 }
    });
    jumpPrev = keys.jump;
    trail = [];
  }

  function loadLevel(idx, opts) {
    const o = opts || {};
    if (idx !== levelIdx || o.fresh) { levelDeaths = 0; levelTicks = 0; ghosts = []; revengeTold = false; }
    levelIdx = idx;
    respawnTimer = 0;
    particles = [];
    rings = [];
    paintLevelBg(idx);
    world = buildWorld(idx);
    for (const e of world.ents) if (e.t === 'hud') e.pw = measureHudTitle();
    resetPlayer();
    updateHud();
    if (!o.silent) showIntro();
  }

  function killPlayer(reasonKey, forcedSub) {
    if (player.dead) return;
    player.dead = true;
    respawnTimer = 30;
    freeze = 7;
    const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
    spawnParticles(cx, cy, world.inverted ? C.purple : C.accent, 18, 16);
    spawnParticles(cx, cy, C.danger, 14, 12);
    rings.push({ x: cx, y: cy, r: 10, life: 22, max: 22, color: '255,61,61' });

    // Menüdeki demo: ölüm sayılmaz, ses ve bildirim yok
    if (screen === 'menu') {
      demoRun++;
      ghosts.push({ x: cx, y: cy });
      if (ghosts.length > 10) ghosts.shift();
      return;
    }

    save.deaths++;
    save.ldeaths[levelIdx] = (save.ldeaths[levelIdx] || 0) + 1;
    levelDeaths++;
    persist();
    ZT.audio.play('die');
    ZT.audio.duck();
    flash();
    const dEl = document.querySelector('.hud-stat.deaths');
    dEl.classList.remove('bump');
    void dEl.offsetWidth;
    dEl.classList.add('bump');

    // Duruma göre alaycı mesaj
    let sub = forcedSub;
    if (!sub) {
      const near = ghosts.filter((g) => Math.hypot(g.x - cx, g.y - cy) < 70).length;
      const d = world.door;
      const doorDist = Math.hypot(cx - (d.px + T / 2), cy - (d.py + T));
      if (near >= 2) sub = t('ctx.same', { n: near + 1 });
      else if (world.t < 60) sub = t('ctx.fast');
      else if (doorDist < 110 && !d.locked) sub = t('ctx.door');
      else {
        const trolls = t('troll');
        sub = trolls[Math.floor(Math.random() * trolls.length)];
      }
    }
    ghosts.push({ x: cx, y: cy });
    toast(t(reasonKey), 'death', sub);
    updateHud();
  }

  function completeLevel() {
    if (screen === 'menu') {         // demo kapıya ulaştı: başa sar
      demoRun++;
      loadLevel(0, { silent: true, fresh: true });
      return;
    }
    save.cleared[levelIdx] = true;
    const prev = save.best[levelIdx];
    const record = prev == null || levelTicks < prev;
    const timeNote = prev == null ? fmtTime(levelTicks)
      : record ? t('ev.record', { t: fmtTime(levelTicks) })
        : t('ev.time', { t: fmtTime(levelTicks), b: fmtTime(prev) });
    if (record) save.best[levelIdx] = levelTicks;
    save.unlocked = Math.min(N - 1, Math.max(save.unlocked, levelIdx + 1));
    persist();
    if (levelIdx < N - 1) {
      toast(t('ev.levelDone', { n: levelIdx + 1 }), 'win', timeNote);
      transT = TRANS_T;
      loadLevel(levelIdx + 1, { fresh: true });
    } else {
      setScreen('end');
    }
  }

  // ───────────────────────── Oyuncu fiziği ─────────────────────────
  function makeBig() {
    const p = player;
    if (p.big) return;
    const cx = p.x + p.w / 2, bottom = p.y + p.h;
    p.big = true;
    p.w = BIG_W;
    p.h = BIG_H;
    p.x = cx - BIG_W / 2;
    p.y = bottom - BIG_H;
    // Büyüyünce bir şeye gömüldüyse yukarı it
    for (let i = 0; i < 6 && solidsIn(p.x, p.y, p.w, p.h).some((s) => s.c && s.c.k !== 'w'); i++) p.y -= 20;
    p.squash = 1.4;
    shakeAmt = 10;
    ZT.audio.play('grow');
    toast(t('ev.cube'), 'trap');
  }

  function updatePlayer() {
    const p = player;
    const maxv = p.big ? BIG_MAXV : MAXV;
    if (p.look.t > 0) p.look.t--;

    // Dev oyuncu zayıf zemine değdiği an kırar
    if (p.big) {
      forTiles(p.x - 3, p.y - 3, p.w + 6, p.h + 8, (c, tx, ty) => {
        if (c.k === 'w' && c.st === 0) {
          c.st = 2;
          c.vy = 0;
          ZT.audio.play('break');
          spawnParticles(tx * T + T / 2, ty * T + 10, '#6b5a43', 6, 8);
        }
      });
    }

    // Yatay hareket (ivmeli)
    let dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (world.inverted) dir = -dir;
    if (dir !== 0) {
      const acc = p.onGround ? ACC_G : ACC_A;
      const turning = p.vx !== 0 && Math.sign(p.vx) !== dir;
      p.vx += dir * acc * (turning ? 1.8 : 1);
      p.vx = Math.max(-maxv, Math.min(maxv, p.vx));
      p.facing = dir;
      if (turning && p.onGround) dust(p.x + p.w / 2, p.y + p.h, 2, -dir);
    } else {
      const f = p.onGround ? FRIC_G : FRIC_A;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }

    // Zıplama: tampon + coyote time + değişken yükseklik
    if (keys.jump && !jumpPrev) p.buffer = BUFFER;
    else if (p.buffer > 0) p.buffer--;
    jumpPrev = keys.jump;

    if (p.onGround) p.coyote = COYOTE;
    else if (p.coyote > 0) p.coyote--;

    const flipZone = p.buffer > 0 && p.coyote > 0 && world.ents.find((e) => e.t === 'gflip' && inTrig(e.trig));
    if (flipZone) {
      // Mavi alanda zıplamak yerçekimini çevirir
      p.grav = -p.grav;
      p.vy = 3 * p.grav;
      p.coyote = 0;
      p.buffer = 0;
      p.onGround = false;
      p.ride = null;
      p.squash = 1.3;
      flipZone.flash = 20;
      ZT.audio.play('flip');
      spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#4fd1ff', 14, 10);
    } else if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -(p.big ? BIG_JUMP : JUMP) * p.grav;
      p.coyote = 0;
      p.buffer = 0;
      p.jumping = true;
      p.onGround = false;
      p.ride = null;
      p.squash = 1.25;
      ZT.audio.play('jump');
      dust(p.x + p.w / 2, p.y + p.h, 5);
      // Ürkek platformlar: zıpladığın an iniş yerin kaçar
      for (const e of world.ents) {
        if (e.t === 'shy' && !e.fired && inTrig(e.trig)) {
          e.fired = true;
          e.tx = e.px + e.dx;
          alertLook(e.px + e.pw / 2, e.py);
        }
      }
    }
    if (p.jumping && !keys.jump && p.vy * p.grav < CUT) { p.vy = CUT * p.grav; p.jumping = false; }
    if (p.vy * p.grav >= 0) p.jumping = false;

    // Hız sınırı sadece düşüş yönünde (yayın fırlatması kesilmesin)
    p.vy += G * p.grav;
    if (p.grav > 0) p.vy = Math.min(MAXFALL, p.vy);
    else p.vy = Math.max(-MAXFALL, p.vy);

    // X ekseni
    p.x += p.vx;
    const hx = solidsIn(p.x, p.y, p.w, p.h);
    if (hx.length) {
      for (const s of hx) {
        if (p.vx > 0) p.x = Math.min(p.x, s.x - p.w);
        else if (p.vx < 0) p.x = Math.max(p.x, s.x + s.w);
      }
      p.vx = 0;
    }

    // Y ekseni
    const prevTop = p.y;
    const prevBottom = p.y + p.h;
    const wasGround = p.onGround;
    const impact = p.vy;
    p.y += p.vy;
    p.onGround = false;
    p.ride = null;

    // Gizli blok: sadece alttan kafa atınca belirir
    if (p.vy < 0 && p.grav > 0) {
      forTiles(p.x, p.y, p.w, p.h, (c, tx, ty) => {
        if (c.k === '?' && !c.rev && prevTop >= (ty + 1) * T - 0.5) {
          c.rev = true;
          ZT.audio.play('trap');
          spawnParticles(tx * T + T / 2, (ty + 1) * T, C.amber, 12, 8);
        }
      });
    }

    const groundCells = [];
    for (const s of solidsIn(p.x, p.y, p.w, p.h)) {
      if (p.vy > 0 && prevBottom <= s.y + 0.5) {
        p.y = s.y - p.h;
        p.vy = 0;
        if (p.grav > 0) {
          p.onGround = true;
          if (s.c) groundCells.push(s.c);
          if (s.ent && s.ent.t === 'shy') p.ride = s.ent;
        } else p.jumping = false;
      } else if (p.vy < 0 && prevTop >= s.y + s.h - 0.5) {
        p.y = s.y + s.h;
        p.vy = 0;
        if (p.grav < 0) {
          p.onGround = true;
          if (s.c) groundCells.push(s.c);
        } else p.jumping = false;
      }
    }

    // Sahte zemine girince "kırılır", altındaki çukur görünür
    forTiles(p.x, p.y, p.w, p.h, (c) => {
      if (c.k === '~' && !c.broken) { c.broken = true; unmask(c.masked || []); ZT.audio.play('crumble'); }
    });

    // Çöken kareye basınca titremeye başlar (titrerken hâlâ zıplanabilir)
    for (const c of groundCells) {
      if (c.k === '=' && c.st === 0) { c.st = 1; c.t = CRUMBLE_T; ZT.audio.play('crumble'); }
    }

    if (p.onGround && !wasGround && impact > 8) {
      p.squash = 0.78;
      ZT.audio.play('land');
      dust(p.x + p.w / 2, p.y + p.h, 6);
      if (impact > 15) rings.push({ x: p.x + p.w / 2, y: p.y + p.h, r: 6, life: 12, max: 12, color: '236,232,223' });
      if (p.big) shakeAmt = 6;
    }
    if (p.onGround && Math.abs(p.vx) > 5.5 && tick % 6 === 0) dust(p.x + p.w / 2, p.y + p.h, 1, -Math.sign(p.vx));
    p.squash += (1 - p.squash) * 0.22;

    // Gizli geçit: çatlak duvara girince duvar şeffaflaşır
    if (!world.secretOpen) {
      forTiles(p.x, p.y, p.w, p.h, (c) => {
        if (c.k === 'c' && !world.secretOpen) {
          world.secretOpen = true;
          ZT.audio.play('trap');
          toast(t('ev.secret'), 'win');
        }
      });
    }

    // Yay
    if (p.vy >= 0 && p.grav > 0) {
      forTiles(p.x, p.y, p.w, p.h, (c, tx, ty) => {
        if (c.k !== 'S') return;
        const pad = { x: tx * T + 6, y: ty * T + T - 22, w: T - 12, h: 22 };
        if (overlap(pad, { x: p.x, y: p.y, w: p.w, h: p.h })) {
          p.vy = -SPRING;
          p.onGround = false;
          p.coyote = 0;
          p.jumping = false;
          p.squash = 1.35;
          c.anim = 12;
          ZT.audio.play('spring');
          spawnParticles(tx * T + T / 2, ty * T + T - 10, C.accent, 10, 8);
        }
      });
    }

    // Küp (ödül gibi görünür, değil)
    for (const e of world.ents) {
      if (e.t !== 'cube' || e.taken) continue;
      const cy = (e.y + 0.5) * T + Math.sin(world.t * 0.08) * 4;
      if (overlap({ x: (e.x + 0.5) * T - 15, y: cy - 15, w: 30, h: 30 }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
        e.taken = true;
        spawnParticles((e.x + 0.5) * T, cy, C.accent, 24, 12);
        makeBig();
      }
    }
  }

  // ───────────────────────── Tuzaklar ─────────────────────────
  function collapseColumn(x) {
    for (let y = 0; y < ROWS; y++) {
      const c = world.cells[y][x];
      if (c.k === '=' && c.st === 0) { c.st = 1; c.t = 8; }
      else if ((c.k === '^' || c.k === 'v') && c.st === 0) { c.st = 2; c.vy = 0; }
    }
  }

  function updateEnts() {
    const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
    for (const e of world.ents) {
      switch (e.t) {
        case 'trapdoor':
          if (!e.fired && inTrig(e.trig)) {
            e.fired = true;
            for (let j = e.y; j < e.y + e.h; j++) for (let i = e.x; i < e.x + e.w; i++) world.cells[j][i].open = true;
            unmask(e.masked);
            ZT.audio.play('open');
            alertLook((e.x + e.w / 2) * T, (e.y + 1) * T);
          }
          break;

        case 'pop':
          if (!e.fired && inTrig(e.trig)) {
            e.fired = true;
            ZT.audio.play('trap');
            alertLook((e.x + e.w / 2) * T, (e.y + 1) * T);
          }
          if (e.fired && e.p < 1) e.p = Math.min(1, e.p + 0.25);
          break;

        case 'drop':
          if (e.state === 0 && inTrig(e.trig)) {
            e.state = 1;
            ZT.audio.play('trap');
            alertLook(e.px + (e.w * T) / 2, e.py);
          }
          if (e.state === 1) {
            e.vy = Math.min(24, e.vy + 1.3);
            e.py += e.vy;
            const bottom = e.py + e.h * T;
            const ty = Math.floor((bottom - 0.01) / T);
            for (let i = 0; i < e.w; i++) {
              if (isSolid(cellAt(e.x + i, ty))) {
                e.py = ty * T - e.h * T;
                e.state = 2;
                shakeAmt = 8;
                ZT.audio.play('land');
                spawnParticles(e.px + (e.w * T) / 2, e.py + e.h * T, C.ink, 12, 10);
                break;
              }
            }
            if (e.py > H + 200) e.state = 3;
          }
          break;

        case 'slide':
          if (!e.fired && inTrig(e.trig)) { e.fired = true; ZT.audio.play('trap'); alertLook(e.px, (e.y + 1) * T); }
          if (e.fired) {
            const target = e.to * T;
            const d = target - e.px;
            e.px += Math.abs(d) <= e.speed ? d : Math.sign(d) * e.speed;
            // Bumerang: hedefe varınca 1.5 kat hızla geri döner
            if (e.px === target && e.back !== undefined && !e.returned) {
              e.returned = true;
              e.to = e.back;
              e.speed *= 1.5;
              ZT.audio.play('trap');
              spawnParticles(e.px + T / 2, (e.y + 1) * T - 10, C.danger, 8, 8);
              alertLook(e.px, (e.y + 1) * T);
            }
          }
          break;

        case 'invert':
          if (!e.fired && inTrig(e.trig)) {
            e.fired = true;
            world.inverted = true;
            ZT.audio.play('trap');
            toast(t('ev.invert'), 'trap');
            flash();
          }
          break;

        case 'chase':
          if (!e.fired && inTrig(e.trig)) e.fired = true;
          if (e.fired) {
            e.el++;
            if (e.el > e.delay) {
              const upto = Math.min(e.x1, e.x0 + Math.floor((e.el - e.delay) / e.interval));
              while (e.next <= upto) collapseColumn(e.next++);
            }
          }
          break;

        case 'key':
          if (e.state === 0) {
            if (!player.dead && overlap({ x: e.px - 20, y: e.py - 20, w: 40, h: 40 }, { x: player.x, y: player.y, w: player.w, h: player.h })) {
              e.state = 1;
              e.timer = e.delay || 30;
              world.door.locked = false;
              ZT.audio.play('key');
              toast(t('ev.key'), 'win');
              spawnParticles(e.px, e.py, C.gold, 16, 10);
            }
          } else if (e.state === 1) {
            // Bir an omzunda durur...
            e.px += (pcx - e.px) * 0.3;
            e.py += (player.y - 30 - e.py) * 0.3;
            if (--e.timer <= 0) {
              if (e.hostile) {
                // Alındığı yere sıçrar, bir an hırlar, sonra kovalar
                e.state = 2;
                e.growl = 20;
                e.px = e.ox;
                e.py = e.oy - 100;
                spawnParticles(e.px, e.py, C.danger, 14, 10);
                ZT.audio.play('keyTurn');
                toast(t('ev.keyTurn'), 'death');
                shakeAmt = 6;
                alertLook(e.px, e.py);
              } else e.state = 3;
            }
          } else if (e.state === 2 && e.growl > 0) {
            e.growl--;
          } else if (e.state === 2 && !player.dead) {
            // ...sonra dişlerini gösterip kovalar
            const dx = pcx - e.px, dy = pcy - e.py;
            const len = Math.hypot(dx, dy) || 1;
            e.px += (dx / len) * e.speed;
            e.py += (dy / len) * e.speed;
          }
          break;

        case 'shy': {
          const d = Math.max(-7, Math.min(7, e.tx - e.px));
          if (d !== 0) {
            e.px += d;
            if (player.ride === e && player.onGround) player.x += d;
          }
          break;
        }

        case 'ceil':
          if (world.armT < 0 || world.t - world.armT < e.start || player.dead || e.state === 2) {
            if (e.state === 2) {
              e.by = Math.min(H, e.by + 28);
              if (e.by >= 14 * T && !e.slammed) { e.slammed = true; shakeAmt = 16; ZT.audio.play('slam'); }
            }
            break;
          }
          // Yerinde durursan sabrı tükenir (hangi yöne olursa olsun hareket sayılır)
          if (e.ax === undefined || Math.hypot(player.x - e.ax, player.y - e.ay) > 40) {
            e.ax = player.x;
            e.ay = player.y;
            e.idle = 0;
            e.state = 0;
          } else {
            e.idle++;
            if (e.idle === e.warn) {
              e.state = 1;
              ZT.audio.play('rumble');
              toast(t('ev.ceilWarn'), 'trap');
              alertLook(pcx, e.by);
            }
            if (e.idle >= e.slam) { e.state = 2; ZT.audio.play('rumble'); }
          }
          break;

        case 'hud':
          if (e.state === 0 && inTrig(e.trig)) {
            e.state = 1;
            ZT.audio.play('trap');
            toast(t('ev.hudFall'), 'trap');
            alertLook(e.px + e.pw / 2, e.py);
          }
          if (e.state === 1) {
            e.vy = Math.min(32, e.vy + 2);
            e.py += e.vy;
            const top = landedOn(e, e.px, e.pw);
            if (top !== null) {
              e.py = top - e.ph;
              e.state = 2;
              shakeAmt = 10;
              ZT.audio.play('slam');
              spawnParticles(e.px + e.pw / 2, e.py + e.ph, C.ink, 18, 12);
            }
          }
          break;

        case 'window':
          if (e.state === 0 && inTrig(e.trig)) {
            e.state = 1;
            e.anim = 0;
            ZT.audio.play('error');
          } else if (e.state === 1 && ++e.anim >= 8) {
            e.state = 2;
          } else if (e.state === 2 && !player.dead) {
            // Sağ üstteki × kutusuna değersen pencere kapanır
            const xz = { x: e.px + e.pw - 52, y: e.py - 10, w: 52, h: 44 };
            if (overlap(xz, { x: player.x, y: player.y, w: player.w, h: player.h })) {
              e.state = 3;
              ZT.audio.play('close');
              spawnParticles(e.px + e.pw - 20, e.py + 18, C.ink, 14, 10);
              alertLook(e.px + e.pw / 2, e.py + e.ph);
            }
          }
          break;

        case 'gflip':
          if (e.flash > 0) e.flash--;
          break;

        case 'decoy':
          if (e.ate > 0) e.ate--;
          break;

        case 'clone':
          if (!e.on && world.armT >= 0 && world.t - world.armT >= e.start && world.hist.length > e.delay) {
            e.on = true;
            const [hx, hy] = world.hist[world.hist.length - 1 - e.delay];
            ZT.audio.play('clone');
            toast(t('ev.clone'), 'death');
            spawnParticles(hx + PW / 2, hy + PH / 2, C.danger, 20, 10);
            alertLook(hx, hy);
          }
          break;
      }
    }

    // Kareler
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = world.cells[y][x];
        if (c.st === 1 && --c.t <= 0) { c.st = 2; c.vy = 0; }
        else if (c.st === 2 && c.oy < H) { c.vy += 0.8; c.oy += c.vy; }
        if (c.trap && c.open && c.ot < 40) c.ot++;
        if (c.anim > 0) c.anim--;
      }
    }
  }

  function clonePos(e) {
    if (!e.on) return null;
    const h = world.hist[world.hist.length - 1 - e.delay];
    return h ? { x: h[0], y: h[1], f: h[2] } : null;
  }

  function updateDoor() {
    const d = world.door;
    if (d.cooldown > 0) d.cooldown--;
    if (d.lockMsg > 0) d.lockMsg--;
    if (d.jokeTimer > 0 && --d.jokeTimer === 0) toast(t('ev.joke'), 'trap');

    const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
    const dist = Math.hypot(pcx - (d.px + T / 2), pcy - (d.py + T));
    if (!d.locked && d.cooldown === 0 && d.runIdx < d.runs.length && dist < d.runR * T) {
      spawnParticles(d.px + T / 2, d.py + T, C.accent, 18, 12);
      const [nx, ny] = d.runs[d.runIdx];
      d.px = nx * T;
      d.py = (ny - 1) * T;
      toast(t(d.runIdx === 0 ? 'ev.doorRun' : 'ev.doorRun2'), 'trap');
      d.runIdx++;
      d.cooldown = 20;
      ZT.audio.play('trap');
      spawnParticles(d.px + T / 2, d.py + T, C.accent, 18, 12);
      return false;
    }

    const rect = { x: d.px + 8, y: d.py + 6, w: T - 16, h: 2 * T - 6 };
    if (overlap(hurtbox(), rect)) {
      if (d.locked) {
        if (d.lockMsg === 0) { toast(t('ev.locked'), 'trap'); ZT.audio.play('trap'); }
        d.lockMsg = 90;
        return false;
      }
      if (d.fakeWin && !d.faked) {
        d.faked = true;
        ZT.audio.play('win');
        toast(t('ev.fakeWin'), 'win');
        spawnParticles(d.px + T / 2, d.py + T, C.accent, 30, 14);
        d.px = d.fakeWin[0] * T;
        d.py = (d.fakeWin[1] - 1) * T;
        d.jokeTimer = 80;
        return false;
      }
      // Kapıya giriş animasyonu, sonra bir sonraki bölüm
      world.exiting = EXIT_T;
      ZT.audio.play('exit');
      ZT.audio.play('win');
      spawnParticles(d.px + T / 2, d.py + T, C.accent, 34, 16);
      return true;
    }
    return false;
  }

  function checkDeath() {
    const hb = hurtbox();
    let cause = null;
    let sub = null;

    forTiles(hb.x, hb.y, hb.w, hb.h, (c, tx, ty) => {
      if (cause || c.st === 2) return;
      if (c.k === '^' && overlap(hb, { x: tx * T + 8, y: ty * T + 30, w: T - 16, h: 30 })) cause = 'die.spike';
      if (c.k === 'v' && overlap(hb, { x: tx * T + 8, y: ty * T, w: T - 16, h: 30 })) cause = 'die.spike';
      if (c.k === 'x' && overlap(hb, { x: tx * T + 8, y: ty * T, w: T - 16, h: 20 })) { cause = 'die.ghost'; c.rev = true; }
    });

    for (const e of world.ents) {
      if (cause) break;
      switch (e.t) {
        case 'pop':
          if (e.p > 0.4) {
            for (let i = 0; i < e.w; i++) {
              const h = 30 * e.p;
              const sy = e.down ? e.y * T : (e.y + 1) * T - h;
              if (overlap(hb, { x: (e.x + i) * T + 8, y: sy, w: T - 16, h })) {
                cause = 'die.pop';
                if (e.radarHide && save.radar) sub = t('ev.radarLie');
              }
            }
          }
          break;
        case 'drop':
          if (e.state === 1 && overlap(hb, { x: e.px + 4, y: e.py + 4, w: e.w * T - 8, h: e.h * T - 4 })) cause = 'die.crush';
          break;
        case 'slide':
          if (overlap(hb, { x: e.px + 8, y: e.y * T + 30, w: T - 16, h: 30 })) cause = e.returned ? 'die.boomerang' : 'die.slide';
          break;
        case 'key':
          if (e.state === 2 && e.growl === 0 && overlap(hb, { x: e.px - 18, y: e.py - 14, w: 36, h: 28 })) cause = 'die.key';
          break;
        case 'ceil':
          if (hb.y < e.by) cause = 'die.ceil';
          break;
        case 'hud':
          if (e.state === 1 && overlap(hb, { x: e.px, y: e.py, w: e.pw, h: e.ph })) cause = 'die.hud';
          break;
        case 'decoy':
          if (overlap(hb, { x: e.px + 8, y: e.py + 6, w: T - 16, h: 2 * T - 6 })) {
            cause = 'die.decoy';
            e.ate = 40;
            ZT.audio.play('chomp');
          }
          break;
        case 'revenge':
          for (const g of e.pts) if (overlap(hb, { x: g.x - 13, y: g.y - 13, w: 26, h: 26 })) cause = 'die.revenge';
          break;
        case 'clone': {
          const cp = clonePos(e);
          if (cp && overlap(hb, { x: cp.x + 8, y: cp.y + 8, w: PW - 16, h: PH - 12 })) cause = 'die.clone';
          break;
        }
      }
    }

    if (!cause && (player.y > ROWS * T + 20 || player.y < -110)) cause = 'die.void';
    if (cause) killPlayer(cause, sub);
  }

  function updateWorld() {
    if (player.dead) {
      updateEnts();
      if (--respawnTimer <= 0) {
        world = buildWorld(levelIdx);
        for (const e of world.ents) {
          if (e.t === 'hud') e.pw = measureHudTitle();
          if (e.t === 'revenge' && e.pts.length && !revengeTold) { revengeTold = true; toast(t('ev.revenge'), 'trap'); }
        }
        resetPlayer();
      }
      return;
    }
    if (world.exiting > 0) {
      if (--world.exiting === 0) completeLevel();
      return;
    }
    world.t++;
    levelTicks++;
    // Zamanlı tehditler oyuncu ilk hareket ettiğinde başlar (giriş kartını okurken kimse ölmesin)
    if (world.armT < 0 && (Math.abs(player.x - (world.spawn[0] * T + (T - PW) / 2)) > 24 || player.vy < -1)) world.armT = world.t;
    if (levelTicks === 1801) updateHint();
    updateEnts();
    updatePlayer();
    world.hist.push([player.x, player.y, player.facing]);
    if (updateDoor()) return;
    checkDeath();
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.grav;
      p.vx *= 0.98;
      if (--p.life <= 0) particles.splice(i, 1);
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += 7;
      if (--r.life <= 0) rings.splice(i, 1);
    }
    // Hızlı hareket ederken arkada kısa bir iz kalır
    if (!player.dead && (Math.abs(player.vx) > 6.8 || Math.abs(player.vy) > 12)) {
      trail.push({ x: player.x, y: player.y, w: player.w, h: player.h, life: 8 });
    }
    for (let i = trail.length - 1; i >= 0; i--) if (--trail[i].life <= 0) trail.splice(i, 1);
  }

  // Menüde oyun kendi kendine oynar: iki kez tuzağa düşer, üçüncüde atlar, kapı yine kaçar
  function demoInput() {
    const cx = (player.x + player.w / 2) / T;
    keys.left = false;
    keys.right = true;
    keys.jump = demoRun % 3 === 2 && cx > 12.7 && cx < 13.8;
  }

  function step() {
    tick++;
    ZT.audio.quiet = screen === 'menu';
    if (screen === 'playing' || screen === 'menu') {
      if (screen === 'menu') demoInput();
      if (freeze > 0) freeze--;
      else updateWorld();
      updateParticles();
      if (screen === 'playing' && tick % 6 === 0) $('hudTime').textContent = fmtTime(levelTicks);
    }
    if (transT > 0) transT--;
    if (shakeAmt > 0) shakeAmt *= 0.82;
    if (shakeAmt < 0.3) shakeAmt = 0;
    if (player.blink > 0) player.blink--;
    else if (Math.random() < 0.006) player.blink = 7;
  }

  // ───────────────────────── Çizim ─────────────────────────
  // Arka plan bölüm başına bir kez boyanır: perde tonu, uzak siluetler, dev numara
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = W;
  bgCanvas.height = H;
  function paintLevelBg(idx) {
    const b = bgCanvas.getContext('2d');
    const tint = ZT.CHAPTERS[ZT.chapterOf(idx)].tint.join(',');
    let seed = 11 + idx * 97;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    b.fillStyle = C.bg;
    b.fillRect(0, 0, W, H);

    // Perde renginde uzak ışık
    const glow = b.createRadialGradient(W * 0.72, H * 0.3, 0, W * 0.72, H * 0.3, W * 0.6);
    glow.addColorStop(0, 'rgba(' + tint + ',0.07)');
    glow.addColorStop(1, 'rgba(' + tint + ',0)');
    b.fillStyle = glow;
    b.fillRect(0, 0, W, H);

    // Uzak siluetler: zeminle karışmayacak kadar silik
    for (let i = 0; i < 9; i++) {
      const w = (2 + Math.floor(rnd() * 4)) * T;
      const x = Math.floor(rnd() * (COLS - 2)) * T;
      const h = (3 + Math.floor(rnd() * 8)) * T;
      b.fillStyle = 'rgba(236,232,223,' + (0.008 + rnd() * 0.012).toFixed(3) + ')';
      if (rnd() > 0.45) b.fillRect(x, H - h, w, h);
      else b.fillRect(x, 0, w, h * 0.6);
    }

    // Izgara: ince çizgiler ve kesişim noktaları
    b.fillStyle = 'rgba(236,232,223,0.014)';
    for (let x = T; x < W; x += T) b.fillRect(x, 0, 1, H);
    for (let y = T; y < H; y += T) b.fillRect(0, y, W, 1);
    b.fillStyle = C.dot;
    for (let x = T; x < W; x += T) for (let y = T; y < H; y += T) b.fillRect(x - 1, y - 1, 3, 3);

    // Dev bölüm numarası (kontur)
    b.font = '700 560px ' + FONT_DISPLAY;
    b.textAlign = 'right';
    b.textBaseline = 'alphabetic';
    b.fillStyle = 'rgba(236,232,223,0.014)';
    b.fillText(pad2(idx + 1), W - 50, 640);
    b.lineWidth = 2;
    b.strokeStyle = 'rgba(' + tint + ',0.09)';
    b.strokeText(pad2(idx + 1), W - 50, 640);

    const v = b.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.62)');
    b.fillStyle = v;
    b.fillRect(0, 0, W, H);
  }
  // Yazı tipi sonradan yüklenirse numara doğru fontla yeniden çizilsin
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => paintLevelBg(levelIdx));

  // Zemin dokusu: yüzeyden derine doğru koyulaşan dört ton
  const TILE_TONES = ['#1e1e25', '#17171c', '#121216', '#0e0e11'];
  const tileTex = TILE_TONES.map((tone, d) => {
    const cv = document.createElement('canvas');
    cv.width = T;
    cv.height = T;
    const b = cv.getContext('2d');
    b.fillStyle = tone;
    b.fillRect(0, 0, T, T);
    let seed = 7 + d * 31;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 22; i++) {
      b.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)';
      b.fillRect(Math.floor(rnd() * T), Math.floor(rnd() * T), 2, 2);
    }
    if (d === 0) {
      // Yüzey karesinde hafif çapraz tarama
      b.strokeStyle = 'rgba(236,232,223,0.035)';
      b.lineWidth = 2;
      b.beginPath();
      for (let i = -T; i < T; i += 12) { b.moveTo(i, T); b.lineTo(i + T, 0); }
      b.stroke();
    }
    return cv;
  });

  function tileDepth(tx, ty) {
    let d = 0;
    while (d < 3 && ty - d - 1 >= 0 && looksSolid(cellAt(tx, ty - d - 1))) d++;
    return d;
  }

  // Havada süzülen toz zerreleri (atmosfer)
  const motes = Array.from({ length: 48 }, (_, i) => ({
    x: (i * 397) % W, y: (i * 613) % H, sp: 0.15 + (i % 5) * 0.06, s: 1 + (i % 3), ph: i * 1.7
  }));

  function hatch(x, y, w, h, color, gap) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -h; i < w; i += gap) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); }
    ctx.stroke();
    ctx.restore();
  }

  function dashedRect(x, y, w, h, color) {
    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.restore();
  }

  function drawSolid(tx, ty, oy) {
    const x = tx * T, y = ty * T + (oy || 0);
    const d = tileDepth(tx, ty);
    ctx.drawImage(tileTex[d], x, y);
    if (d === 0) {
      ctx.fillStyle = C.edge;
      ctx.fillRect(x, y, T, 4);
      ctx.fillStyle = 'rgba(236,232,223,0.07)';
      ctx.fillRect(x, y + 4, T, 5);
    }
    ctx.fillStyle = C.platSide;
    if (!looksSolid(cellAt(tx - 1, ty))) ctx.fillRect(x, y, 2, T);
    if (!looksSolid(cellAt(tx + 1, ty))) ctx.fillRect(x + T - 2, y, 2, T);
    if (ty + 1 < ROWS && !looksSolid(cellAt(tx, ty + 1))) {
      ctx.fillRect(x, y + T - 2, T, 2);
      // Platformun altına düşen gölge
      const sh = ctx.createLinearGradient(0, y + T, 0, y + T + 26);
      sh.addColorStop(0, 'rgba(0,0,0,0.5)');
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(x, y + T, T, 26);
    }
  }

  function drawCrumble(c, tx, ty) {
    let x = tx * T, y = ty * T + c.oy;
    if (c.st === 1) { x += (Math.random() - 0.5) * 5; y += (Math.random() - 0.5) * 3; }
    ctx.save();
    if (c.st === 2) ctx.globalAlpha = Math.max(0, 1 - c.oy / 260);
    ctx.fillStyle = '#18171d';
    ctx.fillRect(x + 1, y, T - 2, T);
    ctx.fillStyle = c.st === 1 ? C.amber : C.edge;
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 3 + i * 14.5, y, 10, 4);
    ctx.strokeStyle = C.platSide;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 4); ctx.lineTo(x + 24, y + 22); ctx.lineTo(x + 20, y + 34);
    ctx.moveTo(x + 42, y + 4); ctx.lineTo(x + 38, y + 18);
    ctx.stroke();
    ctx.strokeRect(x + 2, y + 1, T - 4, T - 2);
    ctx.restore();
  }

  // Zayıf zemin: ince tahta köprü
  function drawWeak(c, tx, ty) {
    const x = tx * T, y = ty * T + c.oy;
    ctx.save();
    if (c.st === 2) ctx.globalAlpha = Math.max(0, 1 - c.oy / 260);
    const full = ty > 0 && cellAt(tx, ty - 1).k === 'w' || cellAt(tx, ty + 1).k === 'w';
    if (full) {
      // Duvar olarak: tahta istifi
      ctx.fillStyle = '#231e1a';
      ctx.fillRect(x + 4, y, T - 8, T);
      ctx.fillStyle = '#3a3029';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 4, y + 4 + i * 19, T - 8, 3);
      ctx.strokeStyle = '#4a3d33';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 5, y + 1, T - 10, T - 2);
    } else {
      ctx.fillStyle = '#2a231d';
      ctx.fillRect(x, y, T, 18);
      ctx.fillStyle = '#b9a58a';
      ctx.fillRect(x, y, T, 3);
      ctx.fillStyle = '#1a1612';
      ctx.fillRect(x + T / 2 - 1, y + 3, 2, 15);
      ctx.strokeStyle = '#3a3029';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 18); ctx.lineTo(x + 20, y + 40);
      ctx.moveTo(x + T - 8, y + 18); ctx.lineTo(x + T - 20, y + 40);
      ctx.stroke();
    }
    ctx.restore();
  }

  function spikeShape(x, baseY, w, h, down) {
    const n = Math.max(1, Math.round(w / 22));
    const sw = w / n;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const sx = x + i * sw;
      if (!down) { ctx.moveTo(sx, baseY); ctx.lineTo(sx + sw / 2, baseY - h); ctx.lineTo(sx + sw, baseY); }
      else { ctx.moveTo(sx, baseY); ctx.lineTo(sx + sw / 2, baseY + h); ctx.lineTo(sx + sw, baseY); }
    }
    ctx.closePath();
  }

  function drawSpikes(x, baseY, w, h, down, ghost, alpha) {
    ctx.save();
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    spikeShape(x, baseY, w, h, down);
    if (ghost) {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(255,61,61,0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(255,61,61,0.55)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = C.danger;
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSpring(c, tx, ty) {
    const x = tx * T, y = ty * T;
    const comp = c.anim > 0 ? (c.anim > 8 ? -10 : 6) : 0;
    const top = y + T - 24 + comp;
    ctx.save();
    ctx.fillStyle = C.platSide;
    ctx.fillRect(x + 8, y + T - 6, T - 16, 6);
    ctx.strokeStyle = C.dim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const segs = 4;
    const sh = (y + T - 6 - (top + 6)) / segs;
    ctx.moveTo(x + T / 2 - 12, y + T - 6);
    for (let i = 1; i <= segs; i++) ctx.lineTo(x + T / 2 + (i % 2 ? 12 : -12), y + T - 6 - sh * i);
    ctx.stroke();
    ctx.shadowColor = 'rgba(200,255,61,0.5)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = C.accent;
    ctx.fillRect(x + 4, top, T - 8, 6);
    ctx.restore();
  }

  function drawTiles() {
    const radar = save.radar;
    for (let ty = 0; ty < ROWS; ty++) {
      for (let tx = 0; tx < COLS; tx++) {
        const c = world.cells[ty][tx];
        if (c.mask) {
          ctx.drawImage(tileTex[tileDepth(tx, ty)], tx * T, ty * T);
          continue;
        }
        switch (c.k) {
          case '#':
            if (c.trap && c.open) {
              if (c.ot < 40) {
                ctx.save();
                ctx.globalAlpha = 1 - c.ot / 40;
                drawSolid(tx, ty, c.ot * c.ot * 0.35);
                ctx.restore();
              }
            } else {
              drawSolid(tx, ty);
              if (radar && c.trap) dashedRect(tx * T, ty * T, T, T, C.amber);
            }
            break;
          case '~':
            if (c.broken) { dashedRect(tx * T, ty * T, T, T, 'rgba(236,232,223,0.15)'); break; }
            drawSolid(tx, ty);
            if (radar) { hatch(tx * T, ty * T, T, T, 'rgba(255,61,61,0.3)', 10); dashedRect(tx * T, ty * T, T, T, C.danger); }
            break;
          case '=':
            if (c.oy < H) drawCrumble(c, tx, ty);
            break;
          case 'f':
            drawCrumble(c, tx, ty);
            if (radar) dashedRect(tx * T, ty * T, T, T, C.danger);
            break;
          case 'w':
            if (c.oy < H) drawWeak(c, tx, ty);
            break;
          case 'c':
            ctx.save();
            if (world.secretOpen) ctx.globalAlpha = 0.22;
            drawSolid(tx, ty);
            // İnce çatlaklar: dikkatli bakana ipucu
            ctx.strokeStyle = 'rgba(236,232,223,0.13)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx * T + 14, ty * T + 8); ctx.lineTo(tx * T + 24, ty * T + 26); ctx.lineTo(tx * T + 18, ty * T + 44);
            ctx.moveTo(tx * T + 40, ty * T + 30); ctx.lineTo(tx * T + 48, ty * T + 52);
            ctx.stroke();
            ctx.restore();
            if (radar && !world.secretOpen) dashedRect(tx * T, ty * T, T, T, C.accent);
            break;
          case '?':
            if (c.rev) {
              ctx.fillStyle = '#1d160a';
              ctx.fillRect(tx * T, ty * T, T, T);
              hatch(tx * T, ty * T, T, T, 'rgba(255,177,61,0.35)', 12);
              ctx.strokeStyle = C.amber;
              ctx.lineWidth = 2;
              ctx.strokeRect(tx * T + 1, ty * T + 1, T - 2, T - 2);
            } else if (radar) {
              dashedRect(tx * T, ty * T, T, T, C.amber);
            }
            break;
          case '^':
            if (c.oy < H) drawSpikes(tx * T + 4, (ty + 1) * T + c.oy, T - 8, 30, false, false, c.st === 2 ? Math.max(0, 1 - c.oy / 260) : undefined);
            break;
          case 'v':
            drawSpikes(tx * T + 4, ty * T, T - 8, 30, true, false);
            break;
          case 'x':
            if (c.rev) drawSpikes(tx * T + 4, ty * T, T - 8, 20, true, false);
            else if (radar) drawSpikes(tx * T + 4, ty * T, T - 8, 20, true, true);
            break;
          case 'S':
            drawSpring(c, tx, ty);
            break;
        }
      }
    }
  }

  function drawKey(x, y, hostile) {
    ctx.save();
    ctx.translate(x, y);
    if (hostile) ctx.rotate(Math.sin(tick * 0.3) * 0.15);
    const col = hostile ? C.danger : C.gold;
    ctx.shadowColor = hostile ? 'rgba(255,61,61,0.7)' : 'rgba(255,204,77,0.6)';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-10, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(-1, -2.5, 22, 5);
    if (hostile) {
      // Dişler ve gözler
      ctx.beginPath();
      for (let i = 0; i < 4; i++) { ctx.moveTo(2 + i * 5, 2); ctx.lineTo(4.5 + i * 5, 10); ctx.lineTo(7 + i * 5, 2); }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(-15, -4, 4, 4);
      ctx.fillRect(-8, -4, 4, 4);
    } else {
      ctx.fillRect(14, 2, 4, 8);
      ctx.fillRect(8, 2, 4, 6);
    }
    ctx.restore();
  }

  function drawFakeHud(e) {
    ctx.save();
    ctx.fillStyle = C.accent;
    ctx.fillRect(e.px, e.py, 44, 34);
    ctx.font = '700 16px ' + FONT_MONO;
    ctx.fillStyle = '#0a0a0c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pad2(levelIdx + 1), e.px + 22, e.py + 18);
    ctx.font = '700 22px ' + FONT_DISPLAY;
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.fillText(t(ZT.LEVEL_KEYS[levelIdx] + '.title'), e.px + 58, e.py + 18);
    if (e.state === 2) {
      ctx.strokeStyle = C.platSide;
      ctx.lineWidth = 2;
      ctx.strokeRect(e.px, e.py, e.pw, e.ph);
    }
    ctx.restore();
  }

  function drawShy(e) {
    const shaking = e.fired && e.px !== e.tx;
    const x = e.px + (shaking ? (Math.random() - 0.5) * 3 : 0), y = e.py;
    ctx.save();
    ctx.fillStyle = '#1b1a21';
    ctx.fillRect(x, y, e.pw, e.ph);
    ctx.fillStyle = C.edge;
    ctx.fillRect(x, y, e.pw, 4);
    ctx.strokeStyle = C.platSide;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, e.pw - 2, e.ph - 2);
    // Ürkek gözler oyuncuya bakar
    const cx = x + e.pw / 2;
    const dx = Math.max(-3, Math.min(3, (player.x + player.w / 2 - cx) / 80));
    const big = e.fired ? 1.6 : 1;
    ctx.fillStyle = C.ink;
    ctx.fillRect(cx - 14, y + 9, 8 * big, 8 * big);
    ctx.fillRect(cx + 6, y + 9, 8 * big, 8 * big);
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(cx - 12 + dx, y + 11, 3, 4);
    ctx.fillRect(cx + 8 + dx, y + 11, 3, 4);
    if (e.fired) {
      ctx.fillStyle = '#6fb6ff';
      ctx.fillRect(x + e.pw - 10, y - 10 + (tick % 20) / 2, 4, 6);
    }
    ctx.restore();
  }

  function drawCeil(e) {
    const sx = e.state === 1 ? (Math.random() - 0.5) * 6 : 0;
    ctx.save();
    ctx.translate(sx, 0);
    ctx.fillStyle = '#121216';
    ctx.fillRect(-10, 0, W + 20, e.by);
    for (let x = 0; x < W; x += T) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(x, 0, 2, e.by - 20);
    }
    // Uyarı bandı
    ctx.save();
    ctx.beginPath();
    ctx.rect(-10, e.by - 20, W + 20, 20);
    ctx.clip();
    ctx.fillStyle = e.state ? C.danger : C.amber;
    ctx.fillRect(-10, e.by - 20, W + 20, 20);
    ctx.fillStyle = '#0a0a0c';
    for (let x = -40; x < W + 40; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, e.by); ctx.lineTo(x + 18, e.by - 20); ctx.lineTo(x + 36, e.by - 20); ctx.lineTo(x + 18, e.by);
      ctx.fill();
    }
    ctx.restore();
    // Sabır göstergesi
    if (e.state < 2 && world.armT >= 0 && world.t - world.armT >= e.start) {
      const k = Math.min(1, e.idle / e.slam);
      ctx.fillStyle = 'rgba(255,61,61,0.85)';
      ctx.fillRect(0, e.by, W * k, 4);
    }
    ctx.restore();
  }

  function drawEnts() {
    const radar = save.radar;
    for (const e of world.ents) {
      switch (e.t) {
        case 'pop':
          for (let i = 0; i < e.w; i++) {
            const x = (e.x + i) * T + 4;
            const base = (e.y + 1) * T;
            const by = e.down ? e.y * T : base;
            if (e.p > 0) drawSpikes(x, by, T - 8, 30 * e.p, !!e.down, false);
            else if (radar && !e.radarHide) drawSpikes(x, by, T - 8, 30, !!e.down, true);
          }
          break;
        case 'fakeGhost':
          if (radar) for (let i = 0; i < e.w; i++) drawSpikes((e.x + i) * T + 4, (e.y + 1) * T, T - 8, 30, false, true);
          break;
        case 'drop':
          if (e.state < 3) {
            const w = e.w * T, h = e.h * T;
            ctx.drawImage(tileTex[1], e.px, e.py, w, h);
            ctx.strokeStyle = C.platSide;
            ctx.lineWidth = 2;
            ctx.strokeRect(e.px + 1, e.py + 1, w - 2, h - 2);
            ctx.fillStyle = '#2f2e36';
            ctx.fillRect(e.px + 10, e.py + 10, w - 20, 4);
            if (e.state < 2) drawSpikes(e.px + 4, e.py + h, w - 8, 18, true, false);
            if (radar && e.state === 0) {
              ctx.save();
              ctx.setLineDash([6, 8]);
              ctx.strokeStyle = 'rgba(255,61,61,0.5)';
              ctx.beginPath();
              ctx.moveTo(e.px + w / 2, e.py + h + 20);
              ctx.lineTo(e.px + w / 2, H);
              ctx.stroke();
              ctx.restore();
            }
          }
          break;
        case 'slide':
          drawSpikes(e.px + 4, (e.y + 1) * T, T - 8, 30, false, false);
          break;
        case 'trapdoor':
          if (radar && !e.fired) {
            ctx.save();
            ctx.font = '600 13px ' + FONT_MONO;
            ctx.fillStyle = C.amber;
            ctx.textAlign = 'center';
            ctx.fillText('↓', (e.x + e.w / 2) * T, e.y * T + 36);
            ctx.restore();
          }
          break;
        case 'key':
          if (e.state < 3) drawKey(e.px, e.py + (e.state === 0 ? Math.sin(world.t * 0.07) * 5 : 0), e.state === 2);
          break;
        case 'shy':
          drawShy(e);
          break;
        case 'cube':
          if (!e.taken) {
            const cx = (e.x + 0.5) * T, cy = (e.y + 0.5) * T + Math.sin(world.t * 0.08) * 4;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(world.t * 0.03);
            ctx.shadowColor = 'rgba(200,255,61,0.8)';
            ctx.shadowBlur = 26;
            ctx.fillStyle = C.accent;
            ctx.fillRect(-15, -15, 30, 30);
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(-11, -11, 8, 8);
            ctx.restore();
            if (radar) { ctx.save(); ctx.font = '600 13px ' + FONT_MONO; ctx.fillStyle = C.danger; ctx.textAlign = 'center'; ctx.fillText('!', cx, cy - 26); ctx.restore(); }
          }
          break;
        case 'hud':
          drawFakeHud(e);
          break;
        case 'window':
          drawWindow(e);
          break;
        case 'gflip':
          drawFlipZone(e);
          break;
        case 'decoy':
          drawDoorAt(e.px, e.py, false, save.radar, e.ate);
          break;
        case 'revenge':
          drawRevenge(e);
          break;
        case 'clone': {
          const cp = clonePos(e);
          if (cp) drawBody(cp.x, cp.y, PW, PH, 1, cp.f, true);
          break;
        }
      }
    }
    for (const e of world.ents) if (e.t === 'ceil') drawCeil(e);
  }

  function drawSign(e) {
    ctx.save();
    ctx.font = '500 17px ' + FONT_MONO;
    const text = t(e.k);
    const bw = ctx.measureText(text).width + 36;
    const bh = 38;
    const bx = e.x * T + 10;
    const ground = (e.y + 1) * T;
    const by = ground - 112;
    ctx.fillStyle = C.platSide;
    ctx.fillRect(bx + 18, by + bh, 4, ground - by - bh);
    ctx.fillStyle = 'rgba(14,14,17,0.94)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#2c2b33';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    ctx.fillStyle = C.accent;
    ctx.fillRect(bx, by, 3, bh);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + 18, by + bh / 2 + 1);
    ctx.restore();
  }

  function drawDoor() {
    const d = world.door;
    // Çatlak duvarın içindeki gizli kapı, geçit açılana kadar hiç görünmez
    if (!world.secretOpen && cellAt(Math.floor(d.px / T), Math.floor(d.py / T) + 1).k === 'c') return;
    drawDoorAt(d.px, d.py, d.locked, save.radar && (d.runIdx < d.runs.length || (d.fakeWin && !d.faked)));
  }

  function drawDoorAt(x, y, locked, question, ate) {
    const d = { locked };
    const w = T, h = 2 * T;
    const pulse = 0.5 + Math.sin(tick * 0.08) * 0.5;
    const col = d.locked ? C.dim : C.ink;
    ctx.save();
    // Zemine düşen ışık
    if (!d.locked) {
      const fl = ctx.createRadialGradient(x + w / 2, y + h, 4, x + w / 2, y + h, 110);
      fl.addColorStop(0, 'rgba(200,255,61,0.16)');
      fl.addColorStop(1, 'rgba(200,255,61,0)');
      ctx.fillStyle = fl;
      ctx.fillRect(x - 110, y + h - 40, w + 220, 60);
    }
    const glow = ctx.createLinearGradient(0, y, 0, y + h);
    glow.addColorStop(0, 'rgba(200,255,61,0.02)');
    glow.addColorStop(1, d.locked ? 'rgba(236,232,223,0.05)' : 'rgba(200,255,61,0.2)');
    ctx.fillStyle = glow;
    ctx.fillRect(x + 4, y, w - 8, h);
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 5.5, y + 1.5, w - 11, h - 1.5);
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(x + 13, y + 10, w - 26, h - 10);
    ctx.globalAlpha = 1;
    if (d.locked) {
      // Asma kilit
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2 - 6, 8, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.fillRect(x + w / 2 - 12, y + h / 2 - 6, 24, 18);
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(x + w / 2 - 2, y + h / 2, 4, 7);
    } else {
      ctx.fillStyle = C.accent;
      ctx.fillRect(x + w - 22, y + h / 2 + 4, 6, 6);
      ctx.globalAlpha = 0.4 + pulse * 0.6;
      ctx.fillRect(x + w / 2 - 3, y - 12, 6, 6);
      ctx.globalAlpha = 1;
    }
    ctx.font = '700 14px ' + FONT_MONO;
    ctx.fillStyle = col;
    ctx.textAlign = 'center';
    ctx.fillText(t('door.exit'), x + w / 2, y - 22);
    if (question) {
      ctx.fillStyle = C.amber;
      ctx.fillText('?', x + w / 2, y - 42);
    }
    if (ate > 0) {
      // Sahte kapının dişleri
      ctx.fillStyle = C.danger;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.moveTo(x + 8 + i * 11, y + 40); ctx.lineTo(x + 13.5 + i * 11, y + 62); ctx.lineTo(x + 19 + i * 11, y + 40);
        ctx.moveTo(x + 8 + i * 11, y + 92); ctx.lineTo(x + 13.5 + i * 11, y + 70); ctx.lineTo(x + 19 + i * 11, y + 92);
      }
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWindow(e) {
    if (e.state === 0 || e.state === 3) return;
    const k = e.state === 1 ? e.anim / 8 : 1;
    const x = e.px, y = e.py, w = e.pw, h = e.ph;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(k, k);
    ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#e9e7e2';
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#2b2a31';
    ctx.fillRect(x, y, w, 34);
    ctx.font = '600 14px ' + FONT_MONO;
    ctx.fillStyle = '#ece8df';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('⚠  ' + t('win.title'), x + 12, y + 18);
    ctx.fillStyle = '#d9342b';
    ctx.fillRect(x + w - 44, y, 44, 34);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + w - 28, y + 11); ctx.lineTo(x + w - 16, y + 23);
    ctx.moveTo(x + w - 16, y + 11); ctx.lineTo(x + w - 28, y + 23);
    ctx.stroke();
    ctx.fillStyle = '#1a1a1d';
    ctx.font = '700 18px ' + FONT_DISPLAY;
    ctx.fillText(t('win.msg'), x + 16, y + 54);
    ctx.font = '500 12px ' + FONT_MONO;
    ctx.fillStyle = '#5c5a62';
    ctx.fillText(t('win.sub'), x + 16, y + 76);
    // Düğmeler
    const bw = 104;
    ctx.fillStyle = '#2f6fed';
    ctx.fillRect(x + w - bw - 12, y + h - 30, bw, 22);
    ctx.fillStyle = '#d7d4cc';
    ctx.fillRect(x + w - bw * 2 - 20, y + h - 30, bw, 22);
    ctx.font = '600 12px ' + FONT_MONO;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(t('win.ok'), x + w - bw / 2 - 12, y + h - 19);
    ctx.fillStyle = '#1a1a1d';
    ctx.fillText(t('win.retry'), x + w - bw * 1.5 - 20, y + h - 19);
    ctx.strokeStyle = '#9a978f';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.restore();
  }

  function drawFlipZone(e) {
    const [x0, y0, w0, h0] = e.trig.length === 4 ? e.trig : [e.trig[0], 0, e.trig[1], ROWS];
    const x = x0 * T, w = w0 * T;
    // Zemin ile tavan arasındaki boşluğa çiz
    const top = Math.max(y0 * T, 3 * T), bottom = Math.min((y0 + h0) * T, 14 * T);
    ctx.save();
    ctx.fillStyle = e.flash > 0 ? 'rgba(79,209,255,0.18)' : 'rgba(79,209,255,0.06)';
    ctx.fillRect(x, top, w, bottom - top);
    ctx.strokeStyle = 'rgba(79,209,255,0.45)';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, top + 1, w - 2, bottom - top - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(79,209,255,0.75)';
    ctx.font = '700 16px ' + FONT_MONO;
    ctx.textAlign = 'center';
    const bob = Math.sin(tick * 0.06) * 8;
    ctx.fillText('⇅', x + w / 2, (top + bottom) / 2 - 10 + bob);
    ctx.font = '600 13px ' + FONT_MONO;
    ctx.fillText(t('zone.flip'), x + w / 2, (top + bottom) / 2 + 16);
    ctx.restore();
  }

  function drawRevenge(e) {
    for (const g of e.pts) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(tick * 0.05);
      ctx.shadowColor = 'rgba(255,61,61,0.7)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = C.danger;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 ? 7 : 15;
        const a = (i / 16) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Karakter gövdesi (oyuncu ve gölge klonu)
  function drawBody(px, py, pw, ph, squash, facing, shadow, opts) {
    const o = opts || {};
    const sy = squash;
    const sx = 2 - sy;
    const w = pw * sx;
    const h = ph * sy;
    const x = px + (pw - w) / 2;
    const y = py + ph - h;
    const k = pw / PW;

    ctx.save();
    if (shadow) {
      ctx.shadowColor = 'rgba(255,40,40,0.6)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#16080a';
      ctx.fillRect(x, y, w, h);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,61,61,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = C.danger;
      const mid = x + w / 2 + facing * 4;
      ctx.fillRect(mid - 11, y + h * 0.28, 6, 6);
      ctx.fillRect(mid + 4, y + h * 0.28, 6, 6);
      ctx.restore();
      return;
    }

    const inv = o.inverted;
    ctx.shadowColor = inv ? 'rgba(167,139,250,0.55)' : 'rgba(200,255,61,0.45)';
    ctx.shadowBlur = 22 * k;
    ctx.fillStyle = inv ? C.purple : C.accent;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x, y, w, 3 * k);

    // Gözler: koşarken kısık, düşerken kocaman, tuzak tetiklenince oraya bakar
    ctx.fillStyle = '#0a0a0c';
    let lx = facing * 4 * k, ly = 0;
    if (o.look && o.look.t > 0) {
      const dx = o.look.x - (x + w / 2), dy = o.look.y - (y + h / 2);
      const len = Math.hypot(dx, dy) || 1;
      lx = (dx / len) * 6 * k;
      ly = (dy / len) * 4 * k;
    }
    let ew = 6 * k, eh = 10 * k, eyeY = y + h * 0.28 + ly;
    if (o.falling) { ew = 8 * k; eh = 13 * k; eyeY -= 2 * k; }
    else if (o.running) { eh = 5 * k; eyeY += 3 * k; }
    if (o.blink) eh = 2 * k;
    const mid = x + w / 2 + lx;
    if (inv) {
      ctx.strokeStyle = '#0a0a0c';
      ctx.lineWidth = 3 * k;
      [[mid - 9 * k, eyeY + 2 * k], [mid + 6 * k, eyeY + 2 * k]].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(ex - 4 * k, ey - 2 * k); ctx.lineTo(ex + 4 * k, ey + 8 * k);
        ctx.moveTo(ex + 4 * k, ey - 2 * k); ctx.lineTo(ex - 4 * k, ey + 8 * k);
        ctx.stroke();
      });
    } else {
      ctx.fillRect(mid - 5 * k - ew, eyeY, ew, eh);
      ctx.fillRect(mid + 4 * k, eyeY, ew, eh);
      if (o.falling) {
        ctx.fillStyle = C.accent;
        ctx.fillRect(mid - 5 * k - ew + 2 * k, eyeY + 2 * k, 2 * k, 2 * k);
        ctx.fillRect(mid + 6 * k, eyeY + 2 * k, 2 * k, 2 * k);
      }
    }
    ctx.restore();
  }

  function drawPlayer() {
    if (player.dead || (screen !== 'playing' && screen !== 'paused' && screen !== 'menu')) return;
    const p = player;
    if (world.exiting === 0) {
      ctx.save();
      ctx.fillStyle = world.inverted ? C.purple : C.accent;
      for (const tr of trail) {
        ctx.globalAlpha = (tr.life / 8) * 0.16;
        ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
      }
      ctx.restore();
    }
    if (world.exiting > 0) {
      // Kapıya doğru küçülerek girer
      const k = world.exiting / EXIT_T;
      const d = world.door;
      const tx = d.px + T / 2, ty = d.py + T * 1.5;
      const cx = tx + (p.x + p.w / 2 - tx) * k, cy = ty + (p.y + p.h / 2 - ty) * k;
      ctx.save();
      ctx.globalAlpha = 0.3 + k * 0.7;
      drawBody(cx - (p.w * k) / 2, cy - (p.h * k) / 2, p.w * k, p.h * k, 1, p.facing, false, {});
      ctx.restore();
      return;
    }
    ctx.save();
    if (p.grav < 0) {
      // Ters yerçekiminde karakter baş aşağı çizilir
      ctx.translate(0, 2 * p.y + p.h);
      ctx.scale(1, -1);
    }
    drawBody(p.x, p.y, p.w, p.h, p.squash, p.facing, false, {
      inverted: world.inverted,
      look: p.look,
      blink: p.blink > 0,
      falling: !p.onGround && p.vy * p.grav > 9,
      running: p.onGround && Math.abs(p.vx) > 6.5
    });
    ctx.restore();
  }

  function drawGhosts() {
    if (!ghosts.length) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,61,61,0.22)';
    ctx.lineWidth = 3;
    for (const g of ghosts) {
      ctx.beginPath();
      ctx.moveTo(g.x - 9, g.y - 9); ctx.lineTo(g.x + 9, g.y + 9);
      ctx.moveTo(g.x + 9, g.y - 9); ctx.lineTo(g.x - 9, g.y + 9);
      ctx.stroke();
    }
    if (ghosts.length >= 5) {
      ctx.font = '600 13px ' + FONT_MONO;
      ctx.fillStyle = 'rgba(255,61,61,0.35)';
      ctx.textAlign = 'right';
      ctx.fillText('× ' + ghosts.length, W - 40, H - 30);
    }
    ctx.restore();
  }

  function renderParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.lineWidth = 3;
    for (const r of rings) {
      ctx.globalAlpha = (r.life / r.max) * 0.7;
      ctx.strokeStyle = 'rgb(' + r.color + ')';
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawMotes() {
    ctx.save();
    ctx.fillStyle = 'rgba(236,232,223,0.08)';
    for (const m of motes) {
      const x = (m.x + tick * m.sp) % W;
      const y = (m.y + Math.sin(tick * 0.01 + m.ph) * 24 + H) % H;
      ctx.fillRect(x, y, m.s, m.s);
    }
    ctx.restore();
  }

  function render() {
    ctx.save();
    if (shakeAmt > 0) ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
    ctx.drawImage(bgCanvas, 0, 0);

    drawMotes();

    if (screen !== 'menu') for (const e of world.ents) if (e.t === 'sign') drawSign(e);
    drawDoor();
    drawTiles();
    drawGhosts();
    drawEnts();
    drawPlayer();
    renderParticles();

    if (world.inverted) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
      g.addColorStop(0, 'rgba(167,139,250,0)');
      g.addColorStop(1, 'rgba(167,139,250,0.16)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // Bölüm geçiş perdesi
    if (transT > 0) {
      const k = transT / TRANS_T;
      const x = W * (1 - k);
      ctx.fillStyle = '#060607';
      ctx.fillRect(x, 0, W - x, H);
      ctx.fillStyle = C.accent;
      ctx.fillRect(x - 6, 0, 6, H);
    }
  }

  // ───────────────────────── Ana döngü ─────────────────────────
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    acc += Math.min(250, now - last);
    last = now;
    let steps = 0;
    while (acc >= STEP && steps < 8) {
      step();
      acc -= STEP;
      steps++;
    }
    if (steps === 8) acc = 0;
    render();
    requestAnimationFrame(frame);
  }

  // ───────────────────────── Ekranlar ─────────────────────────
  const SCREENS = ['menu', 'levels', 'settings', 'pause', 'end'];

  function totalBest() {
    let sum = 0;
    for (const b of save.best) if (b != null) sum += b;
    return sum;
  }

  function clearedCount() {
    return save.cleared.filter(Boolean).length;
  }

  function levelLabel(i) {
    return pad2(i + 1) + ' · ' + t(ZT.LEVEL_KEYS[i] + '.title');
  }

  function refreshPause() {
    $('pauseNum').textContent = pad2(levelIdx + 1);
    $('pauseTitle').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.title');
    $('pauseTime').textContent = fmtTime(levelTicks);
    $('pauseBest').textContent = fmtTime(save.best[levelIdx]);
    $('pauseDeaths').textContent = String(levelDeaths);
  }

  function refreshEnd() {
    let worst = 0;
    for (let i = 1; i < N; i++) if ((save.ldeaths[i] || 0) > (save.ldeaths[worst] || 0)) worst = i;
    $('endCleared').textContent = clearedCount() + '/' + N;
    $('endTime').textContent = fmtTime(totalBest());
    $('endDeaths').textContent = String(save.deaths);
    $('endWorst').textContent = save.ldeaths[worst] ? levelLabel(worst) : '–';
  }

  function setScreen(name) {
    const prev = screen;
    screen = name;
    stage.dataset.screen = name;
    const overlay = name === 'paused' ? 'pause' : name;
    SCREENS.forEach((s) => $('scr-' + s).classList.toggle('on', s === overlay));
    const inGame = name === 'playing' || name === 'paused';
    $('hud').classList.toggle('on', inGame);
    stage.classList.toggle('in-menu', !inGame);
    if (name !== 'playing' || prev === 'menu') keys.left = keys.right = keys.jump = false;
    if (name !== 'playing') hideToast();
    if (name === 'menu') refreshMenu();
    if (name === 'levels') {
      chapterSel = ZT.chapterOf(levelsReturn === 'paused' ? levelIdx : firstUnfinished());
    }
    if (name === 'settings') refreshSettings();
    if (name === 'paused') refreshPause();
    if (name === 'end') refreshEnd();
    if (name === 'levels') { setChapter(chapterSel); return; }
    const focusTarget = document.querySelector('#scr-' + overlay + ' [data-autofocus]');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function startLevel(idx) {
    transT = TRANS_T;
    loadLevel(idx, { fresh: true });
    setScreen('playing');
  }

  function firstUnfinished() {
    for (let i = 0; i <= save.unlocked; i++) if (!save.cleared[i]) return i;
    return save.unlocked;
  }

  function refreshMenu() {
    const started = save.unlocked > 0 || save.deaths > 0;
    const done = clearedCount();
    $('btnPlayLabel').textContent = t(started ? 'menu.continue' : 'menu.play');
    $('btnPlayNote').textContent = started ? levelLabel(firstUnfinished()) : '';
    $('menuDeaths').textContent = String(save.deaths);
    $('menuProgress').textContent = pad2(done);
    $('menuTotal').textContent = '/' + N;
    $('menuMeter').style.width = (done / N) * 100 + '%';
    $('menuTime').textContent = done ? fmtTime(totalBest()) : '–';
    document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === ZT.getLang()));
    if (levelIdx !== 0 || player.dead || world.t === 0 || levelDeaths) {
      demoRun = 0;
      loadLevel(0, { silent: true, fresh: true });
    }
  }

  // Bölümün küçük haritası. Yalnızca oyuncunun zaten gördüğü şeyler çizilir:
  // gizli bloklar ve tuzaklar burada da görünmez, sahte zemin sağlam görünür.
  const THUMB_W = 320, THUMB_H = 180;
  function drawThumb(cv, idx) {
    const L = ZT.buildLevel(idx);
    const g = cv.getContext('2d');
    const cols = L.chars[0].length;
    const u = THUMB_W / cols;
    const oy = (THUMB_H - ROWS * u) / 2;
    const solid = (x, y) => y >= 0 && y < ROWS && x >= 0 && x < cols && '#~c'.includes(L.chars[y][x]);
    g.fillStyle = '#08080a';
    g.fillRect(0, 0, THUMB_W, THUMB_H);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < cols; x++) {
        const k = L.chars[y][x];
        const px = x * u, py = oy + y * u;
        if (solid(x, y)) {
          g.fillStyle = '#26252d';
          g.fillRect(px, py, u, u);
          if (!solid(x, y - 1)) { g.fillStyle = '#ece8df'; g.fillRect(px, py, u, 1.5); }
        } else if (k === '=' || k === 'f') {
          g.fillStyle = '#7b7984';
          g.fillRect(px + 1, py, u - 2, 2);
        } else if (k === 'w') {
          g.fillStyle = '#b9a58a';
          g.fillRect(px, py, u, 2);
        } else if (k === '^') {
          g.fillStyle = '#ff3d3d';
          g.fillRect(px + 1, py + u / 2, u - 2, u / 2);
        } else if (k === 'v') {
          g.fillStyle = '#ff3d3d';
          g.fillRect(px + 1, py, u - 2, u / 2);
        } else if (k === 'S') {
          g.fillStyle = '#c8ff3d';
          g.fillRect(px + 1, py + u - 3, u - 2, 3);
        }
      }
    }
    for (const e of L.ents) {
      if (e.t === 'shy') { g.fillStyle = '#7b7984'; g.fillRect(e.x * u, oy + e.y * u, e.w * u, 3); }
      if (e.t === 'gflip') { g.fillStyle = 'rgba(79,209,255,0.18)'; g.fillRect(e.trig[0] * u, oy + 3 * u, e.trig[2] * u, 11 * u); }
    }
    const door = (x, y) => {
      g.strokeStyle = '#c8ff3d';
      g.lineWidth = 1.5;
      g.strokeRect(x * u + 1.5, oy + (y - 1) * u + 1, u - 3, 2 * u - 1);
    };
    if (L.chars[L.door.y][L.door.x] !== 'c') door(L.door.x, L.door.y);
    for (const e of L.ents) if (e.t === 'decoy') door(e.x, e.y);
    g.fillStyle = '#c8ff3d';
    g.fillRect(L.spawn[0] * u + u * 0.2, oy + L.spawn[1] * u + u * 0.1, u * 0.6, u * 0.9);
  }

  function renderLevelGrid() {
    const next = firstUnfinished();

    const rail = $('chRail');
    rail.innerHTML = '';
    ZT.CHAPTERS.forEach((ch, ci) => {
      const total = ch.to - ch.from + 1;
      let done = 0;
      for (let i = ch.from; i <= ch.to; i++) if (save.cleared[i]) done++;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ch' + (ci === chapterSel ? ' active' : '') + (save.unlocked < ch.from ? ' locked' : '');
      b.style.setProperty('--ch', 'rgb(' + ch.tint.join(',') + ')');
      b.innerHTML = '<span class="ch-name"></span><span class="ch-title"></span><span class="ch-prog"><span></span><span class="meter"><i></i></span></span>';
      b.querySelector('.ch-name').textContent = t(ch.key + '.name') + ' · ' + pad2(ch.from + 1) + '–' + pad2(ch.to + 1);
      b.querySelector('.ch-title').textContent = t(ch.key + '.title');
      b.querySelector('.ch-prog span').textContent = done + '/' + total;
      b.querySelector('.meter i').style.width = (done / total) * 100 + '%';
      b.addEventListener('click', () => { ZT.audio.play('ui'); setChapter(ci, true); });
      rail.appendChild(b);
    });

    const grid = $('levelGrid');
    grid.innerHTML = '';
    const ch = ZT.CHAPTERS[chapterSel];
    let chDone = 0;
    for (let i = ch.from; i <= ch.to; i++) if (save.cleared[i]) chDone++;
    $('chHero').style.setProperty('--ch', 'rgb(' + ch.tint.join(',') + ')');
    $('chHeroName').textContent = t(ch.key + '.name') + ' · ' + pad2(ch.from + 1) + '–' + pad2(ch.to + 1);
    $('chHeroTitle').textContent = t(ch.key + '.title');
    $('chHeroDesc').textContent = t(ch.key + '.desc');
    $('chHeroDone').textContent = String(chDone);
    $('chHeroTotal').textContent = '/' + (ch.to - ch.from + 1);
    let focusCard = null, pinned = false;
    for (let i = ch.from; i <= ch.to; i++) {
      const unlocked = i <= save.unlocked;
      const cleared = save.cleared[i];
      const isNext = unlocked && i === next && !cleared;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'lvl' + (unlocked ? '' : ' locked') + (cleared ? ' cleared' : '') + (isNext ? ' next' : '');
      card.disabled = !unlocked;
      card.style.setProperty('--i', i - ch.from);
      card.innerHTML = '<span class="lvl-thumb"></span><span class="lvl-info"><span class="lvl-num"></span><span class="lvl-title"></span><span class="lvl-stat"><i></i></span></span>';
      const thumb = card.querySelector('.lvl-thumb');
      if (unlocked) {
        const cv = document.createElement('canvas');
        cv.width = THUMB_W;
        cv.height = THUMB_H;
        drawThumb(cv, i);
        thumb.appendChild(cv);
      } else {
        const lock = document.createElement('span');
        lock.className = 'lvl-lock';
        lock.textContent = t('levels.locked');
        thumb.appendChild(lock);
      }
      if (isNext) {
        const flag = document.createElement('span');
        flag.className = 'lvl-flag';
        flag.textContent = t('levels.next');
        thumb.appendChild(flag);
      }
      card.querySelector('.lvl-num').textContent = pad2(i + 1);
      card.querySelector('.lvl-title').textContent = unlocked ? t(ZT.LEVEL_KEYS[i] + '.title') : '? ? ?';
      const stat = card.querySelector('.lvl-stat');
      if (cleared) {
        const tm = document.createElement('b');
        tm.textContent = fmtTime(save.best[i]);
        const dd = document.createElement('span');
        dd.className = 'danger';
        dd.textContent = '✕ ' + (save.ldeaths[i] || 0);
        stat.append(tm, dd);
      } else {
        const sp = document.createElement('span');
        sp.textContent = !unlocked ? t('levels.locked') : (save.ldeaths[i] ? '✕ ' + save.ldeaths[i] + ' · ' : '') + t('levels.none');
        stat.appendChild(sp);
      }
      if (unlocked) card.addEventListener('click', () => { ZT.audio.play('ui'); startLevel(i); });
      const current = levelsReturn === 'paused' && i === levelIdx;
      if (unlocked && (!focusCard || isNext || current) && !pinned) {
        focusCard = card;
        pinned = current;
      }
      grid.appendChild(card);
    }
    return focusCard;
  }

  function setChapter(ci, keepRailFocus) {
    chapterSel = (ci + ZT.CHAPTERS.length) % ZT.CHAPTERS.length;
    const card = renderLevelGrid();
    const target = keepRailFocus ? $('chRail').children[chapterSel] : card || $('chRail').children[chapterSel];
    if (target) target.focus({ preventScroll: true });
  }

  // Yön tuşlarıyla gezinme: o yöndeki en yakın düğmeye geç
  function moveFocus(dx, dy) {
    const scr = document.querySelector('.screen.on');
    if (!scr) return;
    const items = Array.from(scr.querySelectorAll('button:not(:disabled)'));
    const cur = document.activeElement;
    if (!items.includes(cur)) { if (items[0]) items[0].focus({ preventScroll: true }); return; }
    const r = cur.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const q = el.getBoundingClientRect();
      const ex = q.left + q.width / 2 - cx, ey = q.top + q.height / 2 - cy;
      const along = ex * dx + ey * dy;
      if (along <= 4) continue;
      const score = along + (Math.abs(ex * dy) + Math.abs(ey * dx)) * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) best.focus({ preventScroll: true });
  }

  function setSeg(id, value) {
    document.querySelectorAll('#' + id + ' button').forEach((b) => b.classList.toggle('active', b.dataset.v === value));
  }

  let resetArmed = false;
  function refreshSettings() {
    setSeg('setLang', ZT.getLang());
    setSeg('setSound', save.muted ? 'off' : 'on');
    setSeg('setMusic', save.music ? 'on' : 'off');
    setSeg('setRadar', save.radar ? 'on' : 'off');
    setSeg('setFull', document.fullscreenElement ? 'on' : 'off');
    resetArmed = false;
    $('btnReset').textContent = t('settings.resetBtn');
    $('btnReset').classList.remove('armed');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }
  document.addEventListener('fullscreenchange', () => { if (screen === 'settings') refreshSettings(); });

  function on(id, fn) {
    $(id).addEventListener('click', () => { ZT.audio.unlock(); ZT.audio.play('ui'); fn(); });
  }

  on('btnPlay', () => startLevel(firstUnfinished()));
  on('btnLevels', () => { levelsReturn = 'menu'; setScreen('levels'); });
  on('btnSettings', () => { settingsReturn = 'menu'; setScreen('settings'); });
  on('btnResume', () => setScreen('playing'));
  on('btnRestart', () => { loadLevel(levelIdx, { silent: true }); setScreen('playing'); });
  on('btnPauseLevels', () => { levelsReturn = 'paused'; setScreen('levels'); });
  on('btnPauseSettings', () => { settingsReturn = 'paused'; setScreen('settings'); });
  on('btnPauseMenu', () => setScreen('menu'));
  on('btnEndMenu', () => setScreen('menu'));
  on('hudPause', () => setScreen('paused'));

  document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => {
    ZT.audio.play('ui');
    goBack();
  }));

  function goBack() {
    if (screen === 'settings') setScreen(settingsReturn);
    else if (screen === 'levels') setScreen(levelsReturn);
    else if (screen === 'paused') setScreen('playing');
  }

  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    ZT.audio.play('ui');
    ZT.setLang(b.dataset.lang);
  }));

  document.querySelectorAll('#setLang button').forEach((b) => b.addEventListener('click', () => { ZT.setLang(b.dataset.v); ZT.audio.play('ui'); }));
  document.querySelectorAll('#setSound button').forEach((b) => b.addEventListener('click', () => {
    save.muted = b.dataset.v === 'off';
    ZT.audio.muted = save.muted;
    persist();
    refreshSettings();
    ZT.audio.play('ui');
  }));
  document.querySelectorAll('#setMusic button').forEach((b) => b.addEventListener('click', () => {
    save.music = b.dataset.v === 'on';
    ZT.audio.unlock();
    ZT.audio.setMusic(save.music);
    persist();
    refreshSettings();
    ZT.audio.play('ui');
  }));
  document.querySelectorAll('#setRadar button').forEach((b) => b.addEventListener('click', () => {
    save.radar = b.dataset.v === 'on';
    persist();
    refreshSettings();
    updateHud();
    ZT.audio.play('ui');
  }));
  document.querySelectorAll('#setFull button').forEach((b) => b.addEventListener('click', () => {
    const want = b.dataset.v === 'on';
    if (want !== !!document.fullscreenElement) toggleFullscreen();
  }));
  on('btnReset', () => {
    if (!resetArmed) {
      resetArmed = true;
      $('btnReset').textContent = t('settings.resetConfirm');
      $('btnReset').classList.add('armed');
      return;
    }
    const keep = { muted: save.muted, music: save.music };
    save = Object.assign(defaults(), keep);
    persist();
    refreshSettings();
    $('btnReset').textContent = t('settings.resetDone');
    updateHud();
  });

  ZT.onLang(() => {
    if (world) for (const e of world.ents) if (e.t === 'hud') e.pw = measureHudTitle();
    updateHud();
    if (screen === 'menu') refreshMenu();
    if (screen === 'levels') renderLevelGrid();
    if (screen === 'settings') refreshSettings();
    if (screen === 'paused') refreshPause();
    if (screen === 'end') refreshEnd();
  });

  // ───────────────────────── Klavye ─────────────────────────
  const LEFT = ['ArrowLeft', 'KeyA'];
  const RIGHT = ['ArrowRight', 'KeyD'];
  const JUMP_KEYS = ['ArrowUp', 'KeyW', 'Space'];

  window.addEventListener('keydown', (e) => {
    ZT.audio.unlock();
    const c = e.code;

    if (c === 'Escape') {
      e.preventDefault();
      if (screen === 'playing') setScreen('paused');
      else goBack();
      return;
    }
    if (c === 'KeyF' && !e.repeat) { toggleFullscreen(); return; }

    if (screen !== 'playing') {
      if (screen === 'menu' && c === 'Enter' && document.activeElement === document.body) startLevel(firstUnfinished());
      const arrow = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[c];
      if (arrow) { e.preventDefault(); moveFocus(arrow[0], arrow[1]); }
      if (screen === 'levels' && (c === 'KeyQ' || c === 'KeyE') && !e.repeat) {
        ZT.audio.play('ui');
        setChapter(chapterSel + (c === 'KeyE' ? 1 : -1));
      }
      if (screen === 'paused' && c === 'KeyR') { loadLevel(levelIdx, { silent: true }); setScreen('playing'); }
      return;
    }

    if (LEFT.includes(c)) keys.left = true;
    if (RIGHT.includes(c)) keys.right = true;
    if (JUMP_KEYS.includes(c)) { keys.jump = true; e.preventDefault(); }
    if (c === 'KeyR' && !e.repeat && world.exiting === 0) loadLevel(levelIdx, { silent: true });
  });

  window.addEventListener('keyup', (e) => {
    const c = e.code;
    if (LEFT.includes(c)) keys.left = false;
    if (RIGHT.includes(c)) keys.right = false;
    if (JUMP_KEYS.includes(c)) keys.jump = false;
  });

  window.addEventListener('blur', () => {
    keys.left = keys.right = keys.jump = false;
    if (screen === 'playing') setScreen('paused');
  });

  // ───────────────────────── Başlat ─────────────────────────
  loadLevel(0, { silent: true });
  setScreen('menu');
  requestAnimationFrame((now) => { last = now; requestAnimationFrame(frame); });
})();
