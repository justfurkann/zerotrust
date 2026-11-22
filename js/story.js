/* Zero Trust — hikâye: anlatıcı Sıfır, Nokta, Üçgenler, açılış sahnesi, konuşma kutusu
 *
 * Karakterler kodla çizilir (oyunun geri kalanı gibi), böylece canlıdırlar:
 * göz kırpar, konuşurken ağız oynar, yalan söylerken göz seğirir.
 *
 *   Sıfır  : süzülen, tek gözlü, gizemli anlatıcı. Oyundaki bütün sözler onun.
 *   Nokta  : Kare'nin (oyuncunun) en yakın dostu. Açılışta kaçırılır.
 *   Üçgen  : Nokta'yı kaçıran ordu. Dikenler aslında onların askerleri.
 */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  const t = (k, v) => ZT.t(k, v);
  const C = {
    zero: '#c9b6ff', zeroDeep: '#7d6bd6', zeroGlow: 'rgba(201,182,255,0.55)',
    dot: '#ff7ab6', dotDeep: '#d14d8c',
    tri: '#ff3d3d', triDeep: '#a8202a',
    ink: '#ece8df', bg: '#0a0a0c', accent: '#c8ff3d'
  };

  // ───────────────────────── Karakter çizimleri ─────────────────────────

  // Sıfır: hafifçe süzülen yumuşak bir küre, tek büyük göz, başının üstünde
  // kırık bir hale. mood: 'calm' | 'smug' | 'lie' | 'sad' | 'wide'
  function drawZero(g, cx, cy, r, o) {
    o = o || {};
    const time = o.t || 0;
    const bob = Math.sin(time * 0.05) * r * 0.06;
    const y = cy + bob;
    const mood = o.mood || 'calm';
    const glitch = o.glitch || (mood === 'lie' && Math.sin(time * 0.9) > 0.85);
    g.save();

    // Işıltı
    const glow = g.createRadialGradient(cx, y, r * 0.3, cx, y, r * 1.9);
    glow.addColorStop(0, 'rgba(201,182,255,0.28)');
    glow.addColorStop(1, 'rgba(201,182,255,0)');
    g.fillStyle = glow;
    g.fillRect(cx - r * 2, y - r * 2, r * 4, r * 4);

    // Kırık hale
    g.strokeStyle = 'rgba(201,182,255,0.75)';
    g.lineWidth = r * 0.07;
    g.beginPath();
    g.ellipse(cx, y - r * 1.12, r * 0.55, r * 0.14, 0, Math.PI * 1.08, Math.PI * 1.92);
    g.stroke();
    g.beginPath();
    g.ellipse(cx, y - r * 1.12, r * 0.55, r * 0.14, 0, Math.PI * 0.05, Math.PI * 0.8);
    g.stroke();

    // Gövde
    const body = g.createRadialGradient(cx - r * 0.35, y - r * 0.4, r * 0.1, cx, y, r);
    body.addColorStop(0, '#efe8ff');
    body.addColorStop(0.55, C.zero);
    body.addColorStop(1, C.zeroDeep);
    g.fillStyle = body;
    g.beginPath();
    g.arc(cx, y, r, 0, Math.PI * 2);
    g.fill();

    // Gizem: yüzün bir kısmında hilal gölge
    g.save();
    g.beginPath();
    g.arc(cx, y, r, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = 'rgba(20,14,40,0.32)';
    g.beginPath();
    g.arc(cx + r * 0.62, y + r * 0.1, r * 0.95, 0, Math.PI * 2);
    g.fill();
    g.restore();

    // Göz
    const blink = (Math.floor(time) % 210) < 7 && mood !== 'wide';
    const ex = cx - r * 0.12 + (o.lookX || 0) * r * 0.12;
    const ey = y - r * 0.08 + (o.lookY || 0) * r * 0.08;
    const er = r * (mood === 'wide' ? 0.42 : 0.36);
    if (blink) {
      g.strokeStyle = '#1b1533';
      g.lineWidth = r * 0.07;
      g.beginPath();
      g.moveTo(ex - er, ey);
      g.quadraticCurveTo(ex, ey + er * 0.35, ex + er, ey);
      g.stroke();
    } else {
      g.fillStyle = '#fbfaff';
      g.beginPath();
      g.arc(ex, ey, er, 0, Math.PI * 2);
      g.fill();
      // Göz bebeği
      const twitch = mood === 'lie' ? Math.sin(time * 1.7) * er * 0.12 : 0;
      const pr = er * (mood === 'wide' ? 0.42 : 0.5);
      g.fillStyle = '#1b1533';
      g.beginPath();
      g.arc(ex + (o.lookX || 0) * er * 0.35 + twitch, ey + (o.lookY || 0) * er * 0.3, pr, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(ex + (o.lookX || 0) * er * 0.35 - pr * 0.35 + twitch, ey - pr * 0.35, pr * 0.28, 0, Math.PI * 2);
      g.fill();
      // Göz kapağı: kendinden emin ya da üzgün
      if (mood === 'smug' || mood === 'lie' || mood === 'sad') {
        g.fillStyle = C.zero;
        g.beginPath();
        if (mood === 'sad') {
          g.moveTo(ex - er * 1.1, ey - er * 0.2);
          g.lineTo(ex + er * 1.1, ey - er * 0.75);
          g.lineTo(ex + er * 1.1, ey - er * 1.2);
          g.lineTo(ex - er * 1.1, ey - er * 1.2);
        } else {
          g.rect(ex - er * 1.1, ey - er * 1.15, er * 2.2, er * 0.85);
        }
        g.fill();
      }
    }

    // Ağız: konuşurken açılıp kapanır
    const mx = cx + r * 0.05, my = y + r * 0.5;
    g.strokeStyle = '#1b1533';
    g.fillStyle = '#1b1533';
    g.lineWidth = r * 0.06;
    if (o.talk) {
      const open = (Math.sin(time * 0.55) * 0.5 + 0.5) * r * 0.14 + r * 0.03;
      g.beginPath();
      g.ellipse(mx, my, r * 0.11, open, 0, 0, Math.PI * 2);
      g.fill();
    } else if (mood === 'smug' || mood === 'lie') {
      g.beginPath();
      g.moveTo(mx - r * 0.14, my);
      g.quadraticCurveTo(mx + r * 0.02, my + r * 0.1, mx + r * 0.18, my - r * 0.08);
      g.stroke();
    } else if (mood === 'sad') {
      g.beginPath();
      g.moveTo(mx - r * 0.12, my + r * 0.05);
      g.quadraticCurveTo(mx, my - r * 0.06, mx + r * 0.12, my + r * 0.05);
      g.stroke();
    } else {
      g.beginPath();
      g.moveTo(mx - r * 0.1, my);
      g.lineTo(mx + r * 0.1, my);
      g.stroke();
    }

    // Arıza: yatay kaymalar
    if (glitch) {
      for (let i = 0; i < 4; i++) {
        const gy = y - r + Math.random() * r * 2;
        g.fillStyle = i % 2 ? 'rgba(255,61,61,0.45)' : 'rgba(79,209,255,0.45)';
        g.fillRect(cx - r + (Math.random() - 0.5) * r * 0.5, gy, r * 2, r * 0.07);
      }
    }
    g.restore();
  }

  // Nokta: pembe, yuvarlak, iki küçük göz ve yanakları var
  function drawDot(g, cx, cy, r, o) {
    o = o || {};
    const time = o.t || 0;
    g.save();
    g.shadowColor = 'rgba(255,122,182,0.6)';
    g.shadowBlur = r * 0.9;
    g.fillStyle = C.dot;
    g.beginPath();
    g.ellipse(cx, cy, r * (o.squash ? 1.1 : 1), r * (o.squash ? 0.9 : 1), 0, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
    const blink = (Math.floor(time) % 180) < 6;
    const lx = (o.look || 0) * r * 0.15;
    g.fillStyle = '#2a0d1c';
    if (o.scared) {
      g.beginPath(); g.arc(cx - r * 0.32 + lx, cy - r * 0.15, r * 0.17, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx + r * 0.32 + lx, cy - r * 0.15, r * 0.17, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(cx + lx, cy + r * 0.35, r * 0.12, r * 0.16, 0, 0, Math.PI * 2); g.fill();
    } else {
      const eh = blink ? r * 0.04 : r * 0.16;
      g.fillRect(cx - r * 0.38 + lx, cy - r * 0.2, r * 0.13, eh);
      g.fillRect(cx + r * 0.25 + lx, cy - r * 0.2, r * 0.13, eh);
      g.lineWidth = r * 0.08;
      g.strokeStyle = '#2a0d1c';
      g.beginPath();
      g.arc(cx + lx, cy + r * 0.12, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.beginPath(); g.arc(cx - r * 0.55, cy + r * 0.15, r * 0.12, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx + r * 0.55, cy + r * 0.15, r * 0.12, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // Kare: oyuncu (oyundakiyle aynı)
  function drawSquare(g, x, y, s, o) {
    o = o || {};
    g.save();
    g.shadowColor = 'rgba(200,255,61,0.45)';
    g.shadowBlur = s * 0.5;
    g.fillStyle = C.accent;
    g.fillRect(x, y, s, s * 1.2);
    g.shadowBlur = 0;
    g.fillStyle = '#0a0a0c';
    const k = s / 40;
    const look = (o.facing || 1) * 4 * k;
    if (o.sad) {
      g.fillRect(x + s / 2 - 12 * k + look, y + 16 * k, 7 * k, 4 * k);
      g.fillRect(x + s / 2 + 4 * k + look, y + 16 * k, 7 * k, 4 * k);
    } else {
      const eh = o.wide ? 13 * k : 10 * k;
      g.fillRect(x + s / 2 - 11 * k + look, y + 12 * k, 6 * k, eh);
      g.fillRect(x + s / 2 + 4 * k + look, y + 12 * k, 6 * k, eh);
    }
    g.restore();
  }

  // Üçgen asker: kırmızı, tek öfkeli göz
  function drawTri(g, cx, cy, s, o) {
    o = o || {};
    g.save();
    g.translate(cx, cy);
    g.rotate(o.rot || 0);
    g.shadowColor = 'rgba(255,61,61,0.6)';
    g.shadowBlur = s * 0.4;
    g.fillStyle = C.tri;
    g.beginPath();
    g.moveTo(0, -s * 0.6);
    g.lineTo(s * 0.55, s * 0.4);
    g.lineTo(-s * 0.55, s * 0.4);
    g.closePath();
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#fff2f2';
    g.beginPath();
    g.arc(0, s * 0.08, s * 0.14, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2a0508';
    g.beginPath();
    g.arc(o.look ? o.look * s * 0.05 : 0, s * 0.1, s * 0.07, 0, Math.PI * 2);
    g.fill();
    // Öfkeli kaş
    g.strokeStyle = '#2a0508';
    g.lineWidth = s * 0.05;
    g.beginPath();
    g.moveTo(-s * 0.18, -s * 0.12);
    g.lineTo(s * 0.18, -s * 0.02);
    g.stroke();
    g.restore();
  }

  function drawHeart(g, x, y, s, a) {
    g.save();
    g.globalAlpha = a;
    g.fillStyle = C.dot;
    g.beginPath();
    g.moveTo(x, y + s * 0.3);
    g.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.4, y - s * 1.1, x, y - s * 0.45);
    g.bezierCurveTo(x + s * 0.4, y - s * 1.1, x + s, y - s * 0.4, x, y + s * 0.3);
    g.fill();
    g.restore();
  }

  // ───────────────────────── Konuşma kutusu ─────────────────────────
  const $ = (id) => document.getElementById(id);
  const dlg = { el: null, face: null, name: null, text: null, lines: [], i: 0, shown: 0, full: '', onDone: null, open: false, speaker: 'zero', mood: 'calm', talkT: 0 };

  function say(lines, onDone) {
    dlg.lines = lines;
    dlg.i = 0;
    dlg.onDone = onDone || null;
    dlg.open = true;
    dlg.el.classList.add('on');
    showLine();
  }

  function showLine() {
    const L = dlg.lines[dlg.i];
    dlg.speaker = L.who || 'zero';
    dlg.mood = L.mood || 'calm';
    dlg.full = L.text;
    dlg.shown = 0;
    dlg.name.textContent = t('name.' + dlg.speaker);
    dlg.el.dataset.who = dlg.speaker;
    dlg.text.textContent = '';
  }

  function advance() {
    if (!dlg.open) return;
    if (dlg.shown < dlg.full.length) { dlg.shown = dlg.full.length; dlg.text.textContent = dlg.full; return; }
    dlg.i++;
    if (dlg.i < dlg.lines.length) showLine();
    else closeDialog(true);
  }

  function closeDialog(callDone) {
    dlg.open = false;
    dlg.el.classList.remove('on');
    const cb = dlg.onDone;
    dlg.onDone = null;
    if (callDone && cb) cb();
  }

  function tickDialog() {
    if (!dlg.open) return;
    if (dlg.shown < dlg.full.length) {
      dlg.shown = Math.min(dlg.full.length, dlg.shown + 0.75);
      const n = Math.floor(dlg.shown);
      if (dlg.text.textContent.length !== n) {
        dlg.text.textContent = dlg.full.slice(0, n);
        const ch = dlg.full[n - 1];
        if (n % 2 === 0 && ch && ch.trim()) ZT.audio.voice(dlg.speaker);
      }
    }
    const g = dlg.face.getContext('2d');
    g.clearRect(0, 0, 160, 160);
    const talking = dlg.shown < dlg.full.length;
    if (dlg.speaker === 'dot') drawDot(g, 80, 86, 46, { t: frame, squash: talking && frame % 16 < 8 });
    else drawZero(g, 80, 92, 46, { t: frame, talk: talking, mood: dlg.mood });
  }

  // ───────────────────────── Açılış sahnesi ─────────────────────────
  const cine = { el: null, g: null, on: false, t: 0, onDone: null, phase: 'play', fade: 0, dust: [] };
  const GROUND = 840;

  function playIntro(onDone) {
    cine.on = true;
    cine.t = 0;
    cine.phase = 'play';
    cine.fade = 0;
    cine.onDone = onDone;
    cine.dust = Array.from({ length: 40 }, (_, i) => ({ x: (i * 211) % 1920, y: (i * 137) % 900, s: 1 + (i % 3) }));
    cine.el.classList.add('on');
    $('cineSkip').classList.add('on');
  }

  function endIntro() {
    if (!cine.on) return;
    cine.on = false;
    cine.el.classList.remove('on');
    $('cineSkip').classList.remove('on');
    if (dlg.open) closeDialog(false);
    const cb = cine.onDone;
    cine.onDone = null;
    if (cb) cb();
  }

  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
  const lerp = (a, b, k) => a + (b - a) * k;

  // Zaman çizelgesi (tick, 60/sn)
  const T_RUMBLE = 230, T_TRI = 290, T_GRAB = 390, T_FLEE = 450, T_ALONE = 600, T_ZERO = 700, T_TALK = 790;

  function introLines() {
    const z = t('story.intro');
    const moods = ['calm', 'calm', 'calm', 'smug', 'smug', 'lie'];
    return z.map((text, i) => ({ who: 'zero', text, mood: moods[i] || 'calm' }));
  }

  function drawIntro() {
    const g = cine.g;
    const f = cine.t;
    const W = 1920, H = 1080;
    const danger = ease((f - T_RUMBLE) / 60) * (1 - ease((f - T_ALONE) / 90));
    const shake = f > T_RUMBLE && f < T_FLEE + 40 ? (Math.random() - 0.5) * 10 * danger : 0;

    g.save();
    g.translate(shake, shake * 0.5);
    // Gökyüzü
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, `rgb(${10 + 40 * danger},${10},${14})`);
    sky.addColorStop(1, '#060607');
    g.fillStyle = sky;
    g.fillRect(-20, -20, W + 40, H + 40);
    // Toz
    g.fillStyle = 'rgba(236,232,223,0.07)';
    for (const d of cine.dust) g.fillRect((d.x + f * (0.3 + d.s * 0.2)) % W, d.y + Math.sin(f * 0.01 + d.x) * 10, d.s, d.s);
    // Zemin
    g.fillStyle = '#151519';
    g.fillRect(-20, GROUND, W + 40, H - GROUND + 20);
    g.fillStyle = C.ink;
    g.fillRect(-20, GROUND, W + 40, 4);

    // Kare
    let kx = 760, ky = GROUND - 48, kWide = false, kSad = false, kFace = 1;
    if (f < T_RUMBLE) ky -= Math.abs(Math.sin(f * 0.08)) * 46;
    else if (f < T_GRAB) { kWide = true; kFace = 1; }
    else if (f < T_ALONE) {
      // Peşlerinden koşar, üçgen duvarına çarpar
      const k = ease((f - T_FLEE) / 80);
      kx = lerp(760, 1120, k);
      if (f > T_FLEE + 80 && f < T_FLEE + 110) ky -= Math.sin(((f - T_FLEE - 80) / 30) * Math.PI) * 120;
      if (f >= T_FLEE + 110) kx = lerp(1120, 1050, ease((f - T_FLEE - 110) / 20));
      kWide = true;
    } else { kx = 1050; kSad = true; }
    drawSquare(g, kx, ky, 40, { wide: kWide, sad: kSad, facing: kFace });

    // Duvara dönüşen dikenler (üçgen askerler)
    if (f > T_FLEE + 70) {
      const rise = ease((f - T_FLEE - 70) / 20);
      for (let i = 0; i < 5; i++) drawTri(g, 1180 + i * 46, GROUND - 22 * rise, 44 * rise + 0.1, { look: -1 });
    }

    // Nokta
    let dx = 880, dy = GROUND - 30, scared = false;
    if (f < T_RUMBLE) dy -= Math.abs(Math.sin(f * 0.08 + 1.2)) * 60;
    else if (f < T_GRAB) scared = true;
    else {
      const k = ease((f - T_GRAB) / 200);
      dx = lerp(880, 2200, k);
      dy = lerp(GROUND - 30 - 60 * ease((f - T_GRAB) / 30), -200, ease((f - T_GRAB - 30) / 170));
      scared = true;
    }
    if (f < T_ALONE + 100) drawDot(g, dx, dy, 30, { t: f, scared, look: f > T_RUMBLE ? -1 : 0 });

    // Kalp
    if (f > 110 && f < 200) {
      const k = (f - 110) / 90;
      drawHeart(g, 820, GROUND - 130 - k * 80, 22, 1 - k);
    }

    // Üçgenler iner, biri Nokta'yı kapar
    if (f > T_TRI) {
      const pos = [[620, 380], [780, 300], [980, 280], [1160, 330], [1320, 420], [520, 520]];
      pos.forEach(([tx, ty], i) => {
        const k = ease((f - T_TRI - i * 8) / 60);
        let x = tx, y = lerp(-120, ty, k);
        if (f > T_GRAB) {
          const fk = ease((f - T_GRAB - i * 6) / 180);
          x = lerp(tx, 2300 + i * 80, fk);
          y = lerp(ty, -200, fk);
        }
        drawTri(g, x, y, 64, { rot: Math.sin(f * 0.05 + i) * 0.2, look: x < kx ? 1 : -1 });
      });
      // Taşıyan büyük üçgen
      if (f > T_GRAB - 40) {
        let bx = 880, by = lerp(-150, GROUND - 120, ease((f - T_GRAB + 40) / 40));
        if (f > T_GRAB) { bx = dx; by = dy - 70; }
        if (f < T_ALONE + 100) drawTri(g, bx, by, 110, { look: -1 });
      }
    }

    // "KARE!" balonu
    if (f > T_GRAB && f < T_GRAB + 110) {
      const bx = Math.min(dx, 1700), by = Math.max(dy - 90, 60);
      g.fillStyle = 'rgba(14,14,17,0.95)';
      g.strokeStyle = C.dot;
      g.lineWidth = 3;
      g.font = '700 34px "Space Grotesk", system-ui';
      const txt = t('story.shout');
      const w = g.measureText(txt).width + 40;
      g.fillRect(bx - w / 2, by - 30, w, 56);
      g.strokeRect(bx - w / 2, by - 30, w, 56);
      g.fillStyle = C.dot;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(txt, bx, by);
    }

    // Kırmızı ton
    if (danger > 0) {
      g.fillStyle = `rgba(255,30,30,${0.12 * danger})`;
      g.fillRect(-20, -20, W + 40, H + 40);
    }

    // Sıfır belirir
    if (f > T_ZERO) {
      const k = ease((f - T_ZERO) / 60);
      const zx = 1300, zy = 560;
      if (k < 1) {
        // Önce parazit
        for (let i = 0; i < 30 * (1 - k); i++) {
          g.fillStyle = i % 3 ? 'rgba(201,182,255,0.5)' : 'rgba(255,255,255,0.4)';
          g.fillRect(zx - 120 + Math.random() * 240, zy - 120 + Math.random() * 240, 4 + Math.random() * 30, 3);
        }
      }
      g.globalAlpha = k;
      drawZero(g, zx, zy, 70 * (0.4 + 0.6 * k), {
        t: f, talk: dlg.open && dlg.shown < dlg.full.length, mood: dlg.open ? dlg.mood : 'calm',
        lookX: -0.6, lookY: 0.4, glitch: k < 1
      });
      g.globalAlpha = 1;
    }

    // Sinematik şeritler
    g.fillStyle = '#000';
    g.fillRect(-20, -20, W + 40, 100);
    g.fillRect(-20, H - 80, W + 40, 100);
    g.restore();

    // Kararma
    if (cine.fade > 0) {
      g.fillStyle = `rgba(6,6,7,${cine.fade})`;
      g.fillRect(0, 0, W, H);
    }
  }

  function tickIntro() {
    if (!cine.on) return;
    if (cine.phase === 'play') {
      cine.t++;
      if (cine.t === T_RUMBLE) ZT.audio.voice('rumble');
      if (cine.t === T_GRAB) ZT.audio.voice('grab');
      if (cine.t === T_FLEE + 95) ZT.audio.voice('bonk');
      if (cine.t === T_ZERO) ZT.audio.voice('glitch');
      if (cine.t === T_TALK) {
        cine.phase = 'talk';
        say(introLines(), () => { cine.phase = 'out'; });
      }
    } else if (cine.phase === 'talk') {
      cine.t++;
    } else if (cine.phase === 'out') {
      cine.t++;
      cine.fade = Math.min(1, cine.fade + 0.03);
      if (cine.fade >= 1) endIntro();
    }
    drawIntro();
  }

  // ───────────────────────── Menüde karşılama ─────────────────────────
  const greet = { el: null, face: null, text: null, lines: [], i: 0, shown: 0, full: '', mood: 'calm', active: false };

  function setGreeting(info) {
    const list = info.first ? t('zero.greetFirst') : t('zero.greetBack');
    const vars = { n: info.deaths, d: info.done, total: info.total };
    greet.lines = list.map((s) => s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m)));
    // Geri dönen oyuncuya ölüm sayısına göre özel bir söz
    if (!info.first && info.deaths >= 100) greet.lines.unshift(t('zero.greetMany', vars));
    greet.i = 0;
    greet.active = true;
    startGreetLine();
  }

  function startGreetLine() {
    greet.full = greet.lines[greet.i % greet.lines.length];
    greet.shown = 0;
    greet.mood = /!|\?/.test(greet.full) ? 'smug' : 'calm';
    greet.text.textContent = '';
  }

  function nextGreeting() {
    if (!greet.lines.length) return;
    if (greet.shown < greet.full.length) { greet.shown = greet.full.length; greet.text.textContent = greet.full; return; }
    greet.i++;
    startGreetLine();
  }

  function tickGreeting() {
    if (!greet.active || !greet.el.offsetParent) return;
    if (greet.shown < greet.full.length) {
      greet.shown = Math.min(greet.full.length, greet.shown + 0.6);
      const n = Math.floor(greet.shown);
      if (greet.text.textContent.length !== n) {
        greet.text.textContent = greet.full.slice(0, n);
        if (n % 2 === 0 && greet.full[n - 1] && greet.full[n - 1].trim()) ZT.audio.voice('zero', 0.6);
      }
    }
    const g = greet.face.getContext('2d');
    g.clearRect(0, 0, 220, 220);
    drawZero(g, 110, 118, 62, { t: frame, talk: greet.shown < greet.full.length, mood: greet.mood, lookX: -0.5, lookY: 0.2 });
  }

  // ───────────────────────── Oyun içi bildirimlerdeki yüz ─────────────────────────
  const toastFace = { el: null, talkUntil: 0, mood: 'calm' };
  function onToast(kind) {
    toastFace.talkUntil = frame + 45;
    toastFace.mood = kind === 'death' ? 'smug' : kind === 'trap' ? 'lie' : kind === 'win' ? 'calm' : 'calm';
  }
  function tickToastFace() {
    if (!toastFace.el || !toastFace.el.offsetParent) return;
    const g = toastFace.el.getContext('2d');
    g.clearRect(0, 0, 96, 96);
    drawZero(g, 48, 54, 28, { t: frame, talk: frame < toastFace.talkUntil, mood: toastFace.mood });
  }

  // ───────────────────────── Döngü ve dışa açılanlar ─────────────────────────
  // Sabit 60 adım/sn: sahne ve yazı hızı monitörün yenileme hızına bağlı olmasın
  let frame = 0;
  let last = 0, acc = 0;
  const STEP = 1000 / 60;
  function loop(now) {
    if (!last) last = now;
    acc += Math.min(250, now - last);
    last = now;
    let n = 0;
    while (acc >= STEP && n < 8) {
      acc -= STEP;
      n++;
      frame++;
      tickIntro();
      tickDialog();
      tickGreeting();
      tickToastFace();
    }
    if (n === 8) acc = 0;
    requestAnimationFrame(loop);
  }

  function init() {
    dlg.el = $('dialog');
    dlg.face = $('dlgFace');
    dlg.name = $('dlgName');
    dlg.text = $('dlgText');
    cine.el = $('cine');
    cine.g = cine.el.getContext('2d');
    greet.el = $('zeroGreet');
    greet.face = $('greetFace');
    greet.text = $('greetText');
    toastFace.el = $('toastFace');
    dlg.el.addEventListener('click', advance);
    greet.face.addEventListener('click', () => { ZT.audio.unlock(); nextGreeting(); });
    $('cineSkip').addEventListener('click', endIntro);
    requestAnimationFrame(loop);
  }

  ZT.story = {
    init,
    drawZero, drawDot, drawSquare, drawTri,
    say, playIntro, setGreeting, onToast,
    active: () => cine.on || dlg.open,
    // Hikâye açıkken tuşlar buraya gelir; true dönerse oyun tuşu görmez
    key(e) {
      if (!cine.on && !dlg.open) return false;
      const c = e.code;
      if (c === 'Escape' && cine.on) { endIntro(); return true; }
      if (!e.repeat && (c === 'Space' || c === 'Enter' || c === 'KeyW' || c === 'ArrowUp')) advance();
      e.preventDefault();
      return true;
    }
  };
})(window.ZT);
