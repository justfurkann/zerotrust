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
  const STEP = 1000 / 60;            // fizik her zaman 60 tick/sn, monitör kaç Hz olursa olsun
  const MOVE_SPEED = 7.8;
  const JUMP_V = 17.2;
  const GRAVITY = 0.82;
  const MAX_FALL = 22;

  const C = {
    bg: '#0a0a0c',
    dot: 'rgba(236, 232, 223, 0.05)',
    plat: '#141418',
    platSide: '#24242b',
    edge: '#ece8df',
    ink: '#ece8df',
    dim: '#7b7984',
    accent: '#c8ff3d',
    danger: '#ff3d3d',
    amber: '#ffb13d',
    purple: '#a78bfa',
    cyan: '#4fd1ff',
    gold: '#ffcc4d'
  };
  const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';
  const FONT_DISPLAY = '"Space Grotesk", system-ui, sans-serif';

  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');

  // ───────────────────────── Kayıt ─────────────────────────
  function defaults() {
    return { unlocked: 0, cleared: [false, false, false, false, false, false], deaths: 0, muted: false, radar: false };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem('zt.save');
      if (raw) {
        const s = Object.assign(defaults(), JSON.parse(raw));
        if (!Array.isArray(s.cleared) || s.cleared.length !== 6) s.cleared = defaults().cleared;
        return s;
      }
    } catch (e) {}
    return defaults();
  }
  function persist() {
    try { localStorage.setItem('zt.save', JSON.stringify(save)); } catch (e) {}
  }
  let save = loadSave();
  ZT.audio.muted = save.muted;

  // ───────────────────────── Durum ─────────────────────────
  let screen = 'menu';            // menu | levels | settings | playing | paused | end
  let settingsReturn = 'menu';
  let levelsReturn = 'menu';
  let levelIdx = 0;
  let level = ZT.buildLevel(0);
  let levelDeaths = 0;
  let respawnTimer = 0;
  let tick = 0;
  let particles = [];

  const keys = { left: false, right: false, jump: false };
  let jumpPrev = false;

  const player = {
    x: 0, y: 0, w: 48, h: 48, vx: 0, vy: 0,
    onGround: false, gravityDir: 1, controlsInverted: false, dead: false,
    facing: 1, squash: 1, blink: 0
  };

  const bonus = {
    x: 820, y: 490, w: 300, h: 96,
    clicks: 0, target: 5, dodges: 0,
    fakes: [],
    msg: { k: 'bonus.start' }
  };

  // ───────────────────────── Yardımcılar ─────────────────────────
  const overlap = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  const pad2 = (n) => String(n).padStart(2, '0');
  const levelNum = (i) => (i === ZT.BONUS_INDEX ? 'B' : pad2(i + 1));

  function spawnParticles(x, y, color, count, power) {
    const p = power || 12;
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * p,
        vy: (Math.random() - 0.5) * p - 2,
        size: 4 + Math.random() * 6,
        color,
        life: 26 + Math.random() * 18,
        max: 44
      });
    }
  }

  // ───────────────────────── Bildirimler ─────────────────────────
  const toastEl = $('toast');
  const toastMain = $('toastMain');
  const toastSub = $('toastSub');
  let toastTimer = null;

  function toast(main, kind, sub) {
    toastMain.textContent = main;
    toastSub.textContent = sub || '';
    toastSub.hidden = !sub;
    toastEl.className = 'toast ' + (kind || 'info');
    void toastEl.offsetWidth;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), sub ? 2600 : 1900);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.classList.remove('on');
  }

  const introEl = $('intro');
  let introTimer = null;
  function showIntro() {
    $('introNum').textContent = levelIdx === ZT.BONUS_INDEX ? t('levels.bonus') : t('levels.level') + ' ' + levelNum(levelIdx);
    $('introTitle').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.title');
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
    $('hudNum').textContent = levelNum(levelIdx);
    $('hudTitle').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.title');
    $('hudDeaths').textContent = String(save.deaths);
    $('hudRadar').hidden = !save.radar;
    const showHint = levelDeaths >= 3;
    $('hint').classList.toggle('on', showHint);
    $('hintText').textContent = t(ZT.LEVEL_KEYS[levelIdx] + '.hint');
  }

  // ───────────────────────── Bölüm yönetimi ─────────────────────────
  function resetPlayer() {
    Object.assign(player, {
      x: level.spawn.x, y: level.spawn.y, vx: 0, vy: 0,
      onGround: false, gravityDir: 1, controlsInverted: false, dead: false,
      facing: 1, squash: 1
    });
    jumpPrev = keys.jump;
    level.goal.moveIdx = 0;
    level.goal.cooldown = 0;
  }

  function resetBonus() {
    bonus.x = 810; bonus.y = 500;
    bonus.clicks = 0; bonus.dodges = 0;
    bonus.fakes = [];
    bonus.msg = { k: 'bonus.start' };
  }

  function loadLevel(idx, opts) {
    const o = opts || {};
    if (idx !== levelIdx || o.fresh) levelDeaths = 0;
    levelIdx = idx;
    respawnTimer = 0;
    particles = [];
    if (idx === ZT.BONUS_INDEX) {
      resetBonus();
    } else {
      level = ZT.buildLevel(idx);
      resetPlayer();
    }
    updateHud();
    if (!o.silent) showIntro();
  }

  function killPlayer(reasonKey) {
    if (player.dead) return;
    player.dead = true;
    respawnTimer = 26;
    save.deaths++;
    levelDeaths++;
    persist();
    ZT.audio.play('die');
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, C.accent, 18, 16);
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, C.danger, 14, 12);
    flash();
    const trolls = t('troll');
    toast(t(reasonKey), 'death', trolls[Math.floor(Math.random() * trolls.length)]);
    updateHud();
  }

  function completeLevel() {
    ZT.audio.play('win');
    save.cleared[levelIdx] = true;
    save.unlocked = Math.max(save.unlocked, levelIdx + 1);
    persist();
    if (levelIdx < ZT.LEVEL_COUNT - 1) {
      toast(t('ev.levelDone', { n: levelIdx + 1 }), 'win');
      loadLevel(levelIdx + 1, { fresh: true });
    } else {
      toast(t('ev.allDone'), 'win');
      loadLevel(ZT.BONUS_INDEX, { fresh: true });
    }
  }

  // ───────────────────────── Platform fiziği ─────────────────────────
  function updatePlatformer() {
    if (player.dead) {
      if (--respawnTimer <= 0) {
        level = ZT.buildLevel(levelIdx);
        resetPlayer();
      }
      return;
    }

    const cx = player.x + player.w / 2;

    // Ters kontrol bölgesi
    if (level.reverseZone) {
      const rz = level.reverseZone;
      const inside = cx >= rz.x && cx <= rz.x + rz.w;
      if (inside && !player.controlsInverted) {
        player.controlsInverted = true;
        toast(t('ev.reverse'), 'trap');
        ZT.audio.play('trap');
      } else if (!inside) {
        player.controlsInverted = false;
      }
    }

    // Yerçekimi lazeri
    if (level.gravityLineX) {
      const restore = level.gravityRestoreX || 9999;
      if (player.x > level.gravityLineX && player.x < restore && player.gravityDir === 1) {
        player.gravityDir = -1;
        player.vy = -6;
        toast(t('ev.gravFlip'), 'trap');
        ZT.audio.play('trap');
      } else if (level.gravityRestoreX && player.x >= restore && player.gravityDir === -1) {
        player.gravityDir = 1;
        player.vy = 6;
        toast(t('ev.gravBack'), 'info');
        ZT.audio.play('trap');
      }
    }

    // Yatay hareket
    let left = keys.left;
    let right = keys.right;
    if (player.controlsInverted) { const tmp = left; left = right; right = tmp; }

    if (left) { player.vx = -MOVE_SPEED; player.facing = -1; }
    else if (right) { player.vx = MOVE_SPEED; player.facing = 1; }
    else {
      player.vx *= 0.72;
      if (Math.abs(player.vx) < 0.2) player.vx = 0;
    }

    // Zıplama
    const jumpPressed = keys.jump && !jumpPrev;
    jumpPrev = keys.jump;
    if (jumpPressed && player.onGround) {
      player.vy = -JUMP_V * player.gravityDir;
      player.onGround = false;
      player.squash = 1.28;
      ZT.audio.play('jump');
      spawnParticles(cx, player.gravityDir === 1 ? player.y + player.h : player.y, C.ink, 6, 6);
    }

    player.vy += GRAVITY * player.gravityDir;
    player.vy = Math.max(-MAX_FALL, Math.min(MAX_FALL, player.vy));

    // X ekseni
    player.x += player.vx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W) player.x = W - player.w;

    for (const p of level.platforms) {
      if (p.type === 'invisible' && !p.revealed) continue;
      if (overlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
        if (player.vx > 0) player.x = p.x - player.w;
        else if (player.vx < 0) player.x = p.x + p.w;
      }
    }

    // Y ekseni
    const prevY = player.y;
    const wasGrounded = player.onGround;
    const impact = Math.abs(player.vy);
    player.y += player.vy;
    player.onGround = false;

    for (const p of level.platforms) {
      if (p.type === 'invisible' && !p.revealed) {
        // Görünmez blok sadece alttan kafa atınca ortaya çıkar
        if (player.gravityDir === 1 && player.vy < 0 && prevY >= p.y + p.h - 6 &&
            overlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
          p.revealed = true;
          player.y = p.y + p.h;
          player.vy = 4;
          ZT.audio.play('trap');
          toast(t('ev.invisible'), 'trap');
          spawnParticles(p.x + p.w / 2, p.y + p.h, C.amber, 14);
        }
        continue;
      }

      if (!overlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) continue;

      if (player.gravityDir === 1) {
        if (player.vy > 0 && prevY + player.h <= p.y + 24) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
          if (p.type === 'falling' && !p.triggered) {
            p.triggered = true;
            ZT.audio.play('trap');
            toast(t('ev.bridge'), 'trap');
          }
        } else if (player.vy < 0 && prevY >= p.y + p.h - 24) {
          player.y = p.y + p.h;
          player.vy = 2;
        }
      } else {
        if (player.vy < 0 && prevY >= p.y + p.h - 24) {
          player.y = p.y + p.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy > 0 && prevY + player.h <= p.y + 24) {
          player.y = p.y - player.h;
          player.vy = -2;
        }
      }
    }

    if (player.onGround && !wasGrounded && impact > 6) {
      player.squash = 0.76;
      ZT.audio.play('land');
    }
    player.squash += (1 - player.squash) * 0.2;

    // Düşen platformlar
    for (const p of level.platforms) {
      if (p.type === 'falling' && p.triggered) {
        if (p.delay > 0) p.delay--;
        else { p.vy += 0.95; p.y += p.vy; }
      }
    }

    // Tavandan düşen dikenler
    for (const cs of level.ceilingSpikes) {
      if (!cs.triggered && Math.abs(cx - cs.triggerX) < 85) {
        cs.triggered = true;
        ZT.audio.play('trap');
        toast(t('ev.ceiling'), 'trap');
      }
      if (cs.triggered) { cs.vy += 1.1; cs.y += cs.vy; }
      if (overlap(player.x + 6, player.y + 6, player.w - 12, player.h - 12, cs.x, cs.y, cs.w, cs.h)) {
        killPlayer('die.ceiling');
        return;
      }
    }

    // Dikenler
    for (const s of level.spikes) {
      if (s.hidden && !s.revealed && Math.abs(cx - s.triggerX) < (s.triggerDist || 95)) {
        s.revealed = true;
        ZT.audio.play('trap');
        spawnParticles(s.x + s.w / 2, s.y + s.h, C.danger, 10);
      }
      if (s.slideToX !== undefined) {
        if (!s.triggered && player.x + player.w > s.triggerX) {
          s.triggered = true;
          ZT.audio.play('trap');
          toast(t('ev.slide'), 'trap');
        }
        if (s.triggered) s.x += (s.slideToX - s.x) * 0.22;
      }
      if ((!s.hidden || s.revealed) &&
          overlap(player.x + 8, player.y + 8, player.w - 16, player.h - 14, s.x, s.y, s.w, s.h)) {
        killPlayer(s.hidden ? 'die.hidden' : 'die.spike');
        return;
      }
    }

    // Sahte kapılar
    for (const fg of level.fakeGoals) {
      if (overlap(player.x, player.y, player.w, player.h, fg.x, fg.y, fg.w, fg.h)) {
        killPlayer('die.fake');
        return;
      }
    }

    // Gerçek kapı (ve kaçması)
    const g = level.goal;
    if (g.cooldown > 0) g.cooldown--;
    const dist = Math.hypot(cx - (g.x + g.w / 2), (player.y + player.h / 2) - (g.y + g.h / 2));
    if (g.cooldown === 0 && g.moveIdx < g.path.length && dist < 95) {
      spawnParticles(g.x + g.w / 2, g.y + g.h / 2, C.accent, 18);
      g.x = g.path[g.moveIdx];
      toast(t(g.texts[g.moveIdx]), 'trap');
      g.moveIdx++;
      g.cooldown = 20;
      ZT.audio.play('trap');
    }

    if (overlap(player.x, player.y, player.w, player.h, g.x, g.y, g.w, g.h)) {
      spawnParticles(g.x + g.w / 2, g.y + g.h / 2, C.accent, 34, 16);
      completeLevel();
      return;
    }

    if (player.y > H + 60 || player.y < -120) killPlayer('die.void');
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.vx *= 0.98;
      if (--p.life <= 0) particles.splice(i, 1);
    }
  }

  function step() {
    tick++;
    if (screen === 'playing' && levelIdx !== ZT.BONUS_INDEX) updatePlatformer();
    if (screen === 'playing') updateParticles();
    if (player.blink > 0) player.blink--;
    else if (Math.random() < 0.006) player.blink = 7;
  }

  // ───────────────────────── Çizim ─────────────────────────
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = W;
  bgCanvas.height = H;
  (function paintBackground() {
    const b = bgCanvas.getContext('2d');
    b.fillStyle = C.bg;
    b.fillRect(0, 0, W, H);
    b.fillStyle = C.dot;
    for (let x = 40; x < W; x += 40) {
      for (let y = 40; y < H; y += 40) b.fillRect(x - 1, y - 1, 2, 2);
    }
    const v = b.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    b.fillStyle = v;
    b.fillRect(0, 0, W, H);
  })();

  function hatch(x, y, w, h, color, gap) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -h; i < w; i += gap) {
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + h, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawPlatform(p) {
    const radar = save.radar;
    if (p.type === 'invisible') {
      if (!p.revealed && !radar) return;
      ctx.save();
      if (p.revealed) {
        ctx.fillStyle = '#1d160a';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        hatch(p.x, p.y, p.w, p.h, 'rgba(255,177,61,0.35)', 12);
        ctx.strokeStyle = C.amber;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
      } else {
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = 'rgba(255,177,61,0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
        ctx.setLineDash([]);
        ctx.font = '600 13px ' + FONT_MONO;
        ctx.fillStyle = C.amber;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t('block.troll'), p.x + p.w / 2, p.y + p.h / 2 + 1);
      }
      ctx.restore();
      return;
    }

    const warn = p.type === 'falling' && (p.triggered || radar);
    let ox = 0;
    if (p.type === 'falling' && p.triggered && p.delay > 0) ox = (Math.random() - 0.5) * 6;

    ctx.fillStyle = C.plat;
    ctx.fillRect(p.x + ox, p.y, p.w, p.h);
    ctx.strokeStyle = C.platSide;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + ox + 1, p.y + 1, p.w - 2, p.h - 2);

    // Yürünebilir yüzey çizgisi
    ctx.fillStyle = warn ? (p.triggered ? C.danger : C.amber) : C.edge;
    ctx.fillRect(p.x + ox, p.y, p.w, 4);
    if (p.h < 120) {
      ctx.globalAlpha = 0.35;
      ctx.fillRect(p.x + ox, p.y + p.h - 2, p.w, 2);
      ctx.globalAlpha = 1;
    }

    if (radar && p.type === 'falling' && !p.triggered) {
      hatch(p.x, p.y + 4, p.w, p.h - 4, 'rgba(255,177,61,0.18)', 14);
      ctx.font = '600 13px ' + FONT_MONO;
      ctx.fillStyle = C.amber;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('block.falling'), p.x + 12, p.y + p.h / 2 + 2);
    }
  }

  function drawSpikes(x, y, w, h, inverted, ghost) {
    const count = Math.max(2, Math.floor(w / 22));
    const stepW = w / count;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const sx = x + i * stepW;
      if (!inverted) {
        ctx.moveTo(sx, y + h);
        ctx.lineTo(sx + stepW / 2, y);
        ctx.lineTo(sx + stepW, y + h);
      } else {
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + stepW / 2, y + h);
        ctx.lineTo(sx + stepW, y);
      }
    }
    ctx.closePath();
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

  function drawDoor(x, y, w, h, fake) {
    const col = fake ? C.gold : C.ink;
    const pulse = 0.5 + Math.sin(tick * 0.08) * 0.5;
    ctx.save();
    // Işık hüzmesi
    const glow = ctx.createLinearGradient(0, y, 0, y + h);
    glow.addColorStop(0, fake ? 'rgba(255,204,77,0.02)' : 'rgba(200,255,61,0.02)');
    glow.addColorStop(1, fake ? 'rgba(255,204,77,0.22)' : 'rgba(200,255,61,0.2)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(x + 10, y + 10, w - 20, h - 10);
    ctx.globalAlpha = 1;

    // Kapı kolu
    ctx.fillStyle = fake ? C.gold : C.accent;
    ctx.fillRect(x + w - 20, y + h / 2, 6, 6);

    // Durum lambası
    ctx.globalAlpha = 0.4 + pulse * 0.6;
    ctx.fillRect(x + w / 2 - 3, y - 10, 6, 6);
    ctx.globalAlpha = 1;

    let label = t('door.exit');
    if (fake) label = save.radar ? t('door.fake') : '★ ' + t('door.reward') + ' ★';
    ctx.font = '700 15px ' + FONT_MONO;
    ctx.fillStyle = fake && save.radar ? C.danger : col;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, x + w / 2, y - 20);
    ctx.restore();
  }

  function drawSign(s) {
    ctx.save();
    ctx.font = '500 17px ' + FONT_MONO;
    const text = t(s.k);
    const tw = ctx.measureText(text).width;
    const bw = tw + 36;
    const bh = 38;
    const bx = s.x;
    const by = s.y - bh - 6;
    // Direk
    ctx.fillStyle = C.platSide;
    ctx.fillRect(bx + 18, by + bh, 4, s.y - (by + bh) + 70);
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

  function drawPlayer() {
    if (player.dead || (screen !== 'playing' && screen !== 'paused')) return;
    const p = player;
    const sy = p.squash;
    const sx = 2 - sy;
    const w = p.w * sx;
    const h = p.h * sy;
    const anchorY = p.gravityDir === 1 ? p.y + p.h : p.y;
    const x = p.x + (p.w - w) / 2;
    const y = p.gravityDir === 1 ? anchorY - h : anchorY;
    const body = p.controlsInverted ? C.purple : C.accent;

    ctx.save();
    ctx.shadowColor = p.controlsInverted ? 'rgba(167,139,250,0.5)' : 'rgba(200,255,61,0.45)';
    ctx.shadowBlur = 22;
    ctx.fillStyle = body;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // Gözler
    ctx.fillStyle = '#0a0a0c';
    const look = p.facing * 5;
    const eyeH = p.blink > 0 ? 2 : 11;
    const eyeY = p.gravityDir === 1 ? y + h * 0.3 : y + h * 0.7 - eyeH;
    const mid = x + w / 2 + look;
    if (p.controlsInverted) {
      // Sersemlemiş gözler: X
      ctx.strokeStyle = '#0a0a0c';
      ctx.lineWidth = 3;
      [[mid - 10, eyeY + 2], [mid + 6, eyeY + 2]].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(ex - 4, ey - 2); ctx.lineTo(ex + 4, ey + 8);
        ctx.moveTo(ex + 4, ey - 2); ctx.lineTo(ex - 4, ey + 8);
        ctx.stroke();
      });
    } else {
      ctx.fillRect(mid - 12, eyeY, 6, eyeH);
      ctx.fillRect(mid + 4, eyeY, 6, eyeH);
    }
    ctx.restore();
  }

  function drawZones() {
    if (level.reverseZone) {
      const rz = level.reverseZone;
      ctx.save();
      ctx.fillStyle = 'rgba(167,139,250,0.05)';
      ctx.fillRect(rz.x, 0, rz.w, H);
      hatch(rz.x, 0, rz.w, H, 'rgba(167,139,250,0.05)', 28);
      ctx.strokeStyle = 'rgba(167,139,250,0.4)';
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rz.x, 0); ctx.lineTo(rz.x, H);
      ctx.moveTo(rz.x + rz.w, 0); ctx.lineTo(rz.x + rz.w, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '700 16px ' + FONT_MONO;
      ctx.fillStyle = 'rgba(167,139,250,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(t('zone.reverse'), rz.x + rz.w / 2, 150);
      ctx.restore();
    }

    if (level.gravityLineX) {
      const lines = [[level.gravityLineX, C.cyan, t('zone.gravity') + ' ↑']];
      if (level.gravityRestoreX) lines.push([level.gravityRestoreX, C.amber, t('zone.gravityBack') + ' ↓']);
      for (const [lx, col, label] of lines) {
        ctx.save();
        ctx.strokeStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 16;
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 12]);
        ctx.lineDashOffset = -tick * 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0); ctx.lineTo(lx, H);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.font = '700 15px ' + FONT_MONO;
        ctx.fillStyle = col;
        ctx.textAlign = 'center';
        ctx.fillText(label, lx, 210);
        ctx.restore();
      }
    }
  }

  function renderWorld() {
    ctx.drawImage(bgCanvas, 0, 0);
    drawZones();
    for (const s of level.signs) drawSign(s);
    for (const p of level.platforms) drawPlatform(p);
    for (const s of level.spikes) {
      if (s.hidden && !s.revealed) { if (save.radar) drawSpikes(s.x, s.y, s.w, s.h, s.inverted, true); }
      else drawSpikes(s.x, s.y, s.w, s.h, s.inverted, false);
    }
    for (const cs of level.ceilingSpikes) drawSpikes(cs.x, cs.y, cs.w, cs.h, true, false);
    for (const fg of level.fakeGoals) drawDoor(fg.x, fg.y, fg.w, fg.h, true);
    drawDoor(level.goal.x, level.goal.y, level.goal.w, level.goal.h, false);
    drawPlayer();
  }

  function renderBonus() {
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 64px ' + FONT_DISPLAY;
    ctx.fillStyle = C.ink;
    ctx.fillText(t('bonus.title'), W / 2, 200);

    ctx.font = '500 22px ' + FONT_MONO;
    ctx.fillStyle = C.dim;
    let msg = bonus.msg.k === 'bonus.taunts' ? t('bonus.taunts')[bonus.msg.i] : t(bonus.msg.k, bonus.msg.v);
    ctx.fillText(msg, W / 2, 252);

    ctx.font = '700 20px ' + FONT_MONO;
    ctx.fillStyle = C.accent;
    ctx.fillText(t('bonus.count', { c: bonus.clicks, t: bonus.target, d: bonus.dodges }), W / 2, 296);

    // İlerleme çubuğu
    const pw = 420;
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(W / 2 - pw / 2, 318, pw, 6);
    ctx.fillStyle = C.accent;
    ctx.fillRect(W / 2 - pw / 2, 318, pw * (bonus.clicks / bonus.target), 6);

    for (const fb of bonus.fakes) drawBonusButton(fb.x, fb.y, fb.w, fb.h, t('bonus.fake'), true);
    drawBonusButton(bonus.x, bonus.y, bonus.w, bonus.h, t('bonus.btn'), false);
    ctx.restore();
  }

  function drawBonusButton(x, y, w, h, label, fake) {
    ctx.save();
    if (!fake) {
      ctx.shadowColor = 'rgba(200,255,61,0.45)';
      ctx.shadowBlur = 30;
    }
    ctx.fillStyle = fake ? '#16161b' : C.accent;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = fake ? '#34333c' : C.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.font = '700 22px ' + FONT_MONO;
    ctx.fillStyle = fake ? C.dim : '#0a0a0c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    ctx.restore();
  }

  function renderParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    if (levelIdx === ZT.BONUS_INDEX) renderBonus();
    else renderWorld();
    renderParticles();
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

  // ───────────────────────── Kaçan buton etkileşimi ─────────────────────────
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }

  function relocateBonus() {
    bonus.x = 180 + Math.random() * (W - 360 - bonus.w);
    bonus.y = 380 + Math.random() * (H - 480 - bonus.h);
  }

  canvas.addEventListener('mousemove', (e) => {
    if (screen !== 'playing' || levelIdx !== ZT.BONUS_INDEX) return;
    const p = canvasPoint(e);
    const d = Math.hypot(p.x - (bonus.x + bonus.w / 2), p.y - (bonus.y + bonus.h / 2));
    // Radar kapalıysa kaçar; her 5 kaçışta bir yorulur.
    if (!save.radar && d < 180 && bonus.dodges % 5 !== 4) {
      bonus.dodges++;
      ZT.audio.play('trap');
      relocateBonus();
      bonus.msg = { k: 'bonus.taunts', i: bonus.dodges % 4 };
      if (bonus.fakes.length < 6) {
        bonus.fakes.push({
          x: 160 + Math.random() * (W - 560),
          y: 380 + Math.random() * (H - 480),
          w: 260, h: 84
        });
      }
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    ZT.audio.unlock();
    if (screen !== 'playing' || levelIdx !== ZT.BONUS_INDEX) return;
    const p = canvasPoint(e);
    if (p.x >= bonus.x && p.x <= bonus.x + bonus.w && p.y >= bonus.y && p.y <= bonus.y + bonus.h) {
      bonus.clicks++;
      bonus.dodges++;
      ZT.audio.play('win');
      spawnParticles(p.x, p.y, C.accent, 26, 16);
      relocateBonus();
      if (bonus.clicks >= bonus.target) {
        save.cleared[ZT.BONUS_INDEX] = true;
        persist();
        setTimeout(() => setScreen('end'), 500);
      } else {
        bonus.msg = { k: 'bonus.hit', v: { c: bonus.clicks, t: bonus.target } };
      }
      return;
    }
    for (const fb of bonus.fakes) {
      if (p.x >= fb.x && p.x <= fb.x + fb.w && p.y >= fb.y && p.y <= fb.y + fb.h) {
        save.deaths++;
        levelDeaths++;
        persist();
        ZT.audio.play('die');
        spawnParticles(p.x, p.y, C.danger, 20);
        flash();
        bonus.msg = { k: 'bonus.fakeHit' };
        bonus.clicks = 0;
        updateHud();
        return;
      }
    }
  });

  // ───────────────────────── Ekranlar ─────────────────────────
  const SCREENS = ['menu', 'levels', 'settings', 'pause', 'end'];

  function setScreen(name) {
    screen = name;
    const overlay = name === 'paused' ? 'pause' : name;
    SCREENS.forEach((s) => $('scr-' + s).classList.toggle('on', s === overlay));
    const inGame = name === 'playing' || name === 'paused';
    $('hud').classList.toggle('on', inGame);
    stage.classList.toggle('in-menu', !inGame);
    if (name !== 'playing') {
      keys.left = keys.right = keys.jump = false;
      hideToast();
    }
    if (name === 'menu') refreshMenu();
    if (name === 'levels') renderLevelGrid();
    if (name === 'settings') refreshSettings();
    if (name === 'end') $('endSub').textContent = t('end.sub', { n: save.deaths });
    canvas.style.cursor = name === 'playing' && levelIdx === ZT.BONUS_INDEX ? 'crosshair' : 'default';
    const focusTarget = document.querySelector('#scr-' + overlay + ' [data-autofocus]');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function startLevel(idx) {
    loadLevel(idx, { fresh: true });
    setScreen('playing');
  }

  function firstUnfinished() {
    for (let i = 0; i < ZT.LEVEL_COUNT; i++) if (!save.cleared[i]) return Math.min(i, save.unlocked);
    return Math.min(save.unlocked, ZT.BONUS_INDEX);
  }

  function refreshMenu() {
    const started = save.unlocked > 0 || save.deaths > 0;
    $('btnPlayLabel').textContent = t(started ? 'menu.continue' : 'menu.play');
    $('menuDeaths').textContent = String(save.deaths);
    document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === ZT.getLang()));
    // Menü arkasında 1. bölüm sahne olarak dursun
    if (levelIdx !== 0 || player.dead) loadLevel(0, { silent: true });
  }

  function renderLevelGrid() {
    const grid = $('levelGrid');
    grid.innerHTML = '';
    for (let i = 0; i <= ZT.BONUS_INDEX; i++) {
      const unlocked = i <= save.unlocked;
      const cleared = save.cleared[i];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'lvl' + (unlocked ? '' : ' locked') + (cleared ? ' cleared' : '') + (i === ZT.BONUS_INDEX ? ' bonus' : '');
      card.disabled = !unlocked;
      const status = cleared ? t('levels.cleared') : unlocked ? t('levels.open') : t('levels.locked');
      card.innerHTML =
        '<span class="lvl-num"></span>' +
        '<span class="lvl-title"></span>' +
        '<span class="lvl-status"><i></i><span></span></span>';
      card.querySelector('.lvl-num').textContent = i === ZT.BONUS_INDEX ? t('levels.bonus') : pad2(i + 1);
      card.querySelector('.lvl-title').textContent = t(ZT.LEVEL_KEYS[i] + '.title');
      card.querySelector('.lvl-status span').textContent = status;
      if (unlocked) card.addEventListener('click', () => { ZT.audio.play('ui'); startLevel(i); });
      grid.appendChild(card);
    }
    const firstOpen = grid.querySelector('.lvl:not(.locked)');
    if (firstOpen) firstOpen.focus({ preventScroll: true });
  }

  function setSeg(id, value) {
    document.querySelectorAll('#' + id + ' button').forEach((b) => b.classList.toggle('active', b.dataset.v === value));
  }

  let resetArmed = false;
  function refreshSettings() {
    setSeg('setLang', ZT.getLang());
    setSeg('setSound', save.muted ? 'off' : 'on');
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

  // Butonlar
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
    const keepMuted = save.muted;
    save = defaults();
    save.muted = keepMuted;
    persist();
    refreshSettings();
    $('btnReset').textContent = t('settings.resetDone');
    updateHud();
  });

  ZT.onLang(() => {
    updateHud();
    if (screen === 'menu') refreshMenu();
    if (screen === 'levels') renderLevelGrid();
    if (screen === 'settings') refreshSettings();
    if (screen === 'end') $('endSub').textContent = t('end.sub', { n: save.deaths });
  });

  // ───────────────────────── Klavye ─────────────────────────
  const LEFT = ['ArrowLeft', 'KeyA'];
  const RIGHT = ['ArrowRight', 'KeyD'];
  const JUMP = ['ArrowUp', 'KeyW', 'Space'];

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
      if (screen === 'menu' && c === 'Enter' && document.activeElement === document.body) {
        startLevel(firstUnfinished());
      }
      return;
    }

    if (LEFT.includes(c)) keys.left = true;
    if (RIGHT.includes(c)) keys.right = true;
    if (JUMP.includes(c)) { keys.jump = true; e.preventDefault(); }
    if (c === 'KeyR' && !e.repeat) {
      loadLevel(levelIdx, { silent: true });
    }
  });

  window.addEventListener('keyup', (e) => {
    const c = e.code;
    if (LEFT.includes(c)) keys.left = false;
    if (RIGHT.includes(c)) keys.right = false;
    if (JUMP.includes(c)) keys.jump = false;
  });

  // Sekme değişince tuşlar takılı kalmasın, oyun da dursun
  window.addEventListener('blur', () => {
    keys.left = keys.right = keys.jump = false;
    if (screen === 'playing') setScreen('paused');
  });

  // ───────────────────────── Başlat ─────────────────────────
  loadLevel(0, { silent: true });
  setScreen('menu');
  requestAnimationFrame((now) => { last = now; requestAnimationFrame(frame); });
})();
