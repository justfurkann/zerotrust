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
    if (o.evil) {
      // Gerçek yüzü: kırmızı parlayan gözler, geniş sırıtış
      g.shadowColor = 'rgba(255,40,40,0.9)';
      g.shadowBlur = r * 0.5;
      g.fillStyle = '#ff2a2a';
      g.beginPath(); g.moveTo(cx - r * 0.5 + lx, cy - r * 0.32); g.lineTo(cx - r * 0.18 + lx, cy - r * 0.14); g.lineTo(cx - r * 0.5 + lx, cy - r * 0.08); g.fill();
      g.beginPath(); g.moveTo(cx + r * 0.5 + lx, cy - r * 0.32); g.lineTo(cx + r * 0.18 + lx, cy - r * 0.14); g.lineTo(cx + r * 0.5 + lx, cy - r * 0.08); g.fill();
      g.shadowBlur = 0;
      g.fillStyle = '#2a0d1c';
      g.beginPath();
      g.moveTo(cx - r * 0.45 + lx, cy + r * 0.12);
      g.quadraticCurveTo(cx + lx, cy + r * 0.62, cx + r * 0.45 + lx, cy + r * 0.12);
      g.closePath();
      g.fill();
      g.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) g.fillRect(cx - r * 0.3 + lx + i * r * 0.17, cy + r * 0.14, r * 0.09, r * 0.1);
    } else if (o.scared) {
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

  // Satırlar ya {who, mood, text} nesnesi ya da "who:mood|metin" biçiminde dize olabilir
  function parseLine(L) {
    if (typeof L !== 'string') return L;
    const bar = L.indexOf('|');
    if (bar < 0) return { who: 'zero', mood: 'calm', text: L };
    const [who, mood] = L.slice(0, bar).split(':');
    return { who: who || 'zero', mood: mood || 'calm', text: L.slice(bar + 1) };
  }

  function say(lines, onDone) {
    dlg.lines = lines.map(parseLine);
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
    if (dlg.speaker === 'dot') drawDot(g, 80, 86, 46, { t: frame, squash: talking && frame % 16 < 8, evil: dlg.mood === 'evil' });
    else drawZero(g, 80, 92, 46, { t: frame, talk: talking, mood: dlg.mood });
  }

  // ───────────────────────── Açılış sahnesi ─────────────────────────
  const cine = { el: null, g: null, on: false, t: 0, onDone: null, phase: 'play', fade: 0, dust: [] };
  const GROUND = 840;

  function playIntro(onDone) {
    cine.scene = 'intro';
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
    if (cine.scene === 'betray') { tickBetray(); return; }
    if (cine.scene === 'end') { tickEnding(); return; }
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

  // ───────────────────────── İhanet sahnesi ─────────────────────────
  // Taht odası. Kafes açılır, Nokta sevinir... sonra gözleri kırmızıya döner.
  function startScene(name, onDone) {
    cine.scene = name;
    cine.on = true;
    cine.t = 0;
    cine.phase = 'play';
    cine.fade = 0;
    cine.k = 0;
    cine.onDone = onDone;
    cine.dust = Array.from({ length: 40 }, (_, i) => ({ x: (i * 211) % 1920, y: (i * 137) % 900, s: 1 + (i % 3) }));
    cine.el.classList.add('on');
    $('cineSkip').classList.add('on');
  }

  function playBetrayal(onDone) { startScene('betray', onDone); }
  function playEnding(onDone) { startScene('end', onDone); }

  function tickBetray() {
    const c = cine;
    c.t++;
    if (c.phase === 'play' && c.t === 120) {
      c.phase = 'hello';
      say(t('story.betray1'), () => { c.phase = 'turn'; c.k = 0; ZT.audio.voice('grab'); });
    } else if (c.phase === 'turn') {
      c.k++;
      if (c.k === 100) {
        c.phase = 'reveal';
        say(t('story.betray2'), () => { c.phase = 'fall'; c.k = 0; ZT.audio.voice('rumble'); });
      }
    } else if (c.phase === 'fall') {
      c.k++;
      if (c.k === 70) ZT.audio.voice('glitch');
      if (c.k === 110) {
        c.phase = 'zero';
        say(t('story.betray3'), () => { c.phase = 'out'; });
      }
    } else if (c.phase === 'out') {
      c.fade = Math.min(1, c.fade + 0.03);
      if (c.fade >= 1) endIntro();
    }
    drawBetray();
  }

  function drawBetray() {
    const g = cine.g, f = cine.t, c = cine;
    const W = 1920, H = 1080;
    const evil = c.phase === 'turn' ? ease(c.k / 60) : (c.phase === 'reveal' || c.phase === 'fall' || c.phase === 'zero' || c.phase === 'out') ? 1 : 0;
    const falling = c.phase === 'fall' || c.phase === 'zero' || c.phase === 'out';
    const shake = falling && c.k < 40 ? (Math.random() - 0.5) * 14 : 0;
    g.save();
    g.translate(shake, 0);
    // Taht odası
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, `rgb(${18 + 40 * evil},8,12)`);
    sky.addColorStop(1, '#060607');
    g.fillStyle = sky;
    g.fillRect(-20, -20, W + 40, H + 40);
    // Sütunlar
    for (let i = 0; i < 6; i++) {
      g.fillStyle = 'rgba(255,255,255,0.03)';
      g.fillRect(140 + i * 330, 100, 70, GROUND - 100);
    }
    // Zemin (Kare'nin altı açılır)
    const gapX = 640, gapW = 220;
    const open = falling ? ease(c.k / 20) : 0;
    g.fillStyle = '#151519';
    g.fillRect(-20, GROUND, gapX + 20, H);
    g.fillRect(gapX + gapW * open, GROUND, W, H);
    g.fillStyle = C.ink;
    g.fillRect(-20, GROUND, gapX + 20, 4);
    g.fillRect(gapX + gapW * open, GROUND, W, 4);
    if (!falling) { g.fillRect(gapX, GROUND, gapW, 4); g.fillStyle = '#151519'; g.fillRect(gapX, GROUND + 4, gapW, H); }

    // Kare
    let kx = lerp(380, 720, ease(f / 90)), ky = GROUND - 48;
    if (falling) ky = GROUND - 48 + Math.max(0, c.k - 15) * Math.max(0, c.k - 15) * 0.6;
    if (ky < H + 100) drawSquare(g, kx, ky, 40, { wide: evil > 0.5 || falling, facing: 1 });

    // Kafes ve Nokta
    const cageX = 900, cageY = GROUND - 180;
    const doorUp = ease((f - 70) / 30);
    let dx = 960, dy = GROUND - 44;
    if (f > 90) dx = lerp(960, 900, ease((f - 90) / 30));
    if (f < 80) dy = GROUND - 44 - 0; else if (f < 120) dy = GROUND - 44 - Math.sin(((f - 80) / 40) * Math.PI) * 70;
    g.strokeStyle = '#8a8791';
    g.lineWidth = 6;
    g.strokeRect(cageX, cageY - 60 * doorUp, 120, 180);
    for (let i = 1; i < 5; i++) {
      g.beginPath();
      g.moveTo(cageX + i * 24, cageY - 60 * doorUp);
      g.lineTo(cageX + i * 24, cageY + 180 - 60 * doorUp);
      g.stroke();
    }
    // Üçgenler Nokta'nın arkasında belirir ve eğilir
    if (evil > 0) {
      for (let i = 0; i < 6; i++) {
        const tx = 1060 + i * 120, ty = GROUND - 40 - (i % 2) * 140;
        g.globalAlpha = evil;
        drawTri(g, tx, ty + 10 * Math.sin(f * 0.05 + i), 80, { rot: -0.25 * evil, look: -1 });
      }
      g.globalAlpha = 1;
    }
    drawDot(g, dx, dy, 36, { t: f, look: -1, evil: evil > 0.6, squash: f > 80 && f < 120 });
    if (f > 95 && f < 160) drawHeart(g, dx, dy - 80 - (f - 95), 20, 1 - (f - 95) / 65);

    // Kırmızı ton
    if (evil > 0) { g.fillStyle = `rgba(255,20,20,${0.14 * evil})`; g.fillRect(-20, -20, W + 40, H + 40); }

    // Düşerken Sıfır belirir
    if (falling && c.k > 70) {
      const k = ease((c.k - 70) / 40);
      g.globalAlpha = k;
      drawZero(g, 760, 420, 64, { t: f, talk: dlg.open && dlg.shown < dlg.full.length, mood: dlg.open ? dlg.mood : 'wide', lookY: 0.6, glitch: k < 1 });
      g.globalAlpha = 1;
    }
    g.fillStyle = '#000';
    g.fillRect(-20, -20, W + 40, 100);
    g.fillRect(-20, H - 80, W + 40, 100);
    g.restore();
    if (c.fade > 0) { g.fillStyle = `rgba(6,6,7,${c.fade})`; g.fillRect(0, 0, W, H); }
  }

  // ───────────────────────── Son sahne ─────────────────────────
  // Şafak. Kare yere oturmuş. Yanında Sıfır.
  function tickEnding() {
    const c = cine;
    c.t++;
    if (c.phase === 'play' && c.t === 100) {
      c.phase = 'talk';
      say(t('story.ending'), () => { c.phase = 'title'; c.k = 0; });
    } else if (c.phase === 'title') {
      c.k++;
      if (c.k > 420) c.phase = 'out';
    } else if (c.phase === 'out') {
      c.fade = Math.min(1, c.fade + 0.025);
      if (c.fade >= 1) endIntro();
    }
    drawEnding();
  }

  function drawEnding() {
    const g = cine.g, f = cine.t, c = cine;
    const W = 1920, H = 1080;
    const sky = g.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#120f24');
    sky.addColorStop(0.6, '#3a2140');
    sky.addColorStop(1, '#ff8a5c');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    // Güneş doğuyor
    const sunY = lerp(GROUND + 60, GROUND - 120, ease(f / 600));
    const sun = g.createRadialGradient(1300, sunY, 10, 1300, sunY, 260);
    sun.addColorStop(0, 'rgba(255,220,160,0.95)');
    sun.addColorStop(0.3, 'rgba(255,170,110,0.5)');
    sun.addColorStop(1, 'rgba(255,140,90,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, W, GROUND);
    g.fillStyle = '#0e0d14';
    g.fillRect(0, GROUND, W, H);
    g.fillStyle = 'rgba(255,200,160,0.5)';
    g.fillRect(0, GROUND, W, 3);
    drawSquare(g, 820, GROUND - 40, 40, { facing: 1 });   // oturmuş: biraz basık
    drawZero(g, 1010, 700 + Math.sin(f * 0.04) * 8, 46, {
      t: f, talk: dlg.open && dlg.shown < dlg.full.length, mood: dlg.open ? dlg.mood : 'calm', lookX: -0.7, lookY: 0.4
    });
    if (c.phase === 'title' || c.phase === 'out') {
      const k = ease(c.k / 120);
      g.fillStyle = `rgba(6,6,7,${0.92 * k})`;
      g.fillRect(0, 0, W, H);
      g.globalAlpha = k;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#ece8df';
      g.font = '700 150px "Space Grotesk", system-ui';
      g.fillText('ZERO TRUST', W / 2, H / 2 - 140);
      g.font = '500 30px "JetBrains Mono", monospace';
      g.fillStyle = '#c9b6ff';
      g.fillText(t('story.theEnd'), W / 2, H / 2 - 20);
      g.fillStyle = '#8a8791';
      g.font = '400 22px "JetBrains Mono", monospace';
      g.fillText(t('story.thanks'), W / 2, H / 2 + 40);
      g.globalAlpha = 1;
    }
    if (c.fade > 0) { g.fillStyle = `rgba(6,6,7,${c.fade})`; g.fillRect(0, 0, W, H); }
  }

  // Perde arası konuşmaları (i18n: chapter.chN)
  function chapterLines(key) {
    const lines = t('chapter.' + key);
    return Array.isArray(lines) ? lines : null;
  }

  // ───────────────────────── Menüde karşılama ─────────────────────────
  const greet = { el: null, face: null, text: null, lines: [], i: 0, shown: 0, full: '', mood: 'calm', active: false };

  function setGreeting(info) {
    const list = info.first ? t('zero.greetFirst') : t('zero.greetBack');
    const vars = { n: info.deaths, d: info.done, total: info.total };
    greet.lines = list.map((s) => s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m)));
    // Geri dönen oyuncuya ölüm sayısına göre özel bir söz
    if (!info.first && info.deaths >= 100) greet.lines.unshift(t('zero.greetMany', vars));
    if (info.lead) greet.lines.unshift(info.lead);   // tek seferlik haber (ör. kayıt taşındı)
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
    say, playIntro, playBetrayal, playEnding, chapterLines, setGreeting, onToast,
    active: () => cine.on || dlg.open,
    // Hikâye açıkken tuşlar buraya gelir; true dönerse oyun tuşu görmez
    key(e) {
      if (!cine.on && !dlg.open) return false;
      const c = e.code;
      if (c === 'Escape' && cine.on) { endIntro(); return true; }
      if (cine.on && cine.phase === 'title' && !e.repeat && (c === 'Space' || c === 'Enter')) { cine.phase = 'out'; e.preventDefault(); return true; }
      if (!e.repeat && (c === 'Space' || c === 'Enter' || c === 'KeyW' || c === 'ArrowUp')) advance();
      e.preventDefault();
      return true;
    }
  };
})(window.ZT);
