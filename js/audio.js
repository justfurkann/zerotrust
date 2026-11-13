/* Zero Trust — ses motoru (Web Audio, dosyasız)
 * Efektler ve prosedürel müzik tamamen kodla üretilir; dışarıdan ses dosyası yok.
 */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  let ac = null;
  let master = null;
  let sfxBus = null;
  let musicBus = null;

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.8;
      master.connect(ac.destination);
      sfxBus = ac.createGain();
      sfxBus.connect(master);
      musicBus = ac.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone(type, freqs, dur, vol, at) {
    const now = ac.currentTime + (at || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.connect(gain);
    gain.connect(sfxBus);
    freqs.forEach(([f, t, ramp]) => {
      if (ramp) osc.frequency.exponentialRampToValueAtTime(f, now + t);
      else osc.frequency.setValueAtTime(f, now + t);
    });
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function noise(dur, vol, cutoff, bus, at) {
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff || 1400;
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus || sfxBus);
    gain.gain.value = vol;
    src.start(at || 0);
    return src;
  }

  // ───────────────────────── Müzik ─────────────────────────
  // Am – F – C – G üzerinde gergin, minimal bir döngü.
  const BPM = 104;
  const SIXTEENTH = 60 / BPM / 4;
  const CHORDS = [
    [57, 60, 64], // Am
    [53, 57, 60], // F
    [48, 52, 55], // C
    [55, 59, 62]  // G
  ];
  const ARP = [0, 1, 2, 1, 0, 2, 1, 2];
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  let musicOn = false;
  let schedTimer = null;
  let nextTime = 0;
  let step = 0;
  let delay = null;

  function musicChain() {
    if (delay) return;
    delay = ac.createDelay(1);
    delay.delayTime.value = SIXTEENTH * 3;
    const fb = ac.createGain();
    fb.gain.value = 0.32;
    const wet = ac.createGain();
    wet.gain.value = 0.35;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(musicBus);
  }

  function note(type, freq, at, dur, vol, cutoff, toDelay) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicBus);
    if (toDelay) gain.connect(delay);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(vol, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  function playStep(s, at) {
    const bar = Math.floor(s / 16) % 4;
    const inBar = s % 16;
    const chord = CHORDS[bar];
    // Bas: her vuruşta, ikinci yarıda oktav sıçraması
    if (inBar % 4 === 0) note('triangle', midi(chord[0] - 12), at, SIXTEENTH * 3.5, 0.22, 420);
    if (inBar === 10 || inBar === 14) note('triangle', midi(chord[0]), at, SIXTEENTH * 1.5, 0.12, 600);
    // Arpej: 8'lik notalar, gecikmeyle
    if (inBar % 2 === 0) {
      const n = chord[ARP[(inBar / 2) % ARP.length]] + 12;
      note('square', midi(n), at, SIXTEENTH * 1.6, 0.035, 1500, true);
    }
    // Hi-hat benzeri tık
    if (inBar % 2 === 1) {
      noise(0.03, 0.025, 7000, musicBus, at);
    }
    // Her 4 barda bir uzun ped
    if (s % 64 === 0) {
      for (const n of CHORDS[0]) note('sawtooth', midi(n), at, SIXTEENTH * 30, 0.012, 900);
    }
  }

  function schedule() {
    while (nextTime < ac.currentTime + 0.15) {
      playStep(step, nextTime);
      nextTime += SIXTEENTH;
      step = (step + 1) % 64;
    }
  }

  function startMusic() {
    if (!ensure() || schedTimer) return;
    musicChain();
    nextTime = ac.currentTime + 0.05;
    step = 0;
    musicBus.gain.cancelScheduledValues(ac.currentTime);
    musicBus.gain.setTargetAtTime(0.9, ac.currentTime, 0.4);
    schedTimer = setInterval(schedule, 40);
  }

  function stopMusic() {
    if (!ac || !schedTimer) return;
    musicBus.gain.setTargetAtTime(0, ac.currentTime, 0.15);
    clearInterval(schedTimer);
    schedTimer = null;
  }

  ZT.audio = {
    muted: false,
    quiet: false,   // menüdeki demo oynarken ses çıkmasın
    unlock() {
      ensure();
      if (musicOn) startMusic();
    },
    setMusic(on) {
      musicOn = on;
      if (!ac) return;
      if (on) startMusic();
      else stopMusic();
    },
    // Ölümde müziği kısa bir an boğ
    duck() {
      if (!ac || !schedTimer) return;
      const t = ac.currentTime;
      musicBus.gain.cancelScheduledValues(t);
      musicBus.gain.setValueAtTime(0.25, t);
      musicBus.gain.setTargetAtTime(0.9, t + 0.25, 0.3);
    },
    play(kind) {
      if (this.muted || this.quiet) return;
      try {
        if (!ensure()) return;
        switch (kind) {
          case 'jump': tone('square', [[220, 0], [440, 0.1, true]], 0.12, 0.05); break;
          case 'land': tone('sine', [[120, 0], [60, 0.06, true]], 0.07, 0.06); break;
          case 'die':
            noise(0.28, 0.22);
            tone('sawtooth', [[240, 0], [60, 0.3, true]], 0.32, 0.09);
            break;
          case 'trap': tone('square', [[620, 0], [180, 0.12, true]], 0.14, 0.06); break;
          case 'win': tone('triangle', [[392, 0], [523, 0.08], [659, 0.16], [784, 0.24]], 0.5, 0.14); break;
          case 'spring': tone('sine', [[260, 0], [980, 0.16, true]], 0.2, 0.09); break;
          case 'crumble': noise(0.12, 0.08); break;
          case 'open':
            tone('square', [[140, 0], [70, 0.15, true]], 0.18, 0.06);
            noise(0.15, 0.06);
            break;
          case 'key':
            tone('triangle', [[988, 0], [1319, 0.06]], 0.22, 0.1);
            tone('sine', [[1976, 0]], 0.25, 0.03, 0.06);
            break;
          case 'keyTurn':
            tone('sawtooth', [[90, 0], [180, 0.2, true]], 0.35, 0.1);
            tone('square', [[1200, 0], [300, 0.25, true]], 0.28, 0.04);
            break;
          case 'rumble': noise(0.6, 0.12, 300); break;
          case 'slam':
            noise(0.4, 0.3, 500);
            tone('sine', [[80, 0], [30, 0.3, true]], 0.35, 0.25);
            break;
          case 'clone':
            tone('sine', [[440, 0], [220, 0.5, true]], 0.6, 0.06);
            tone('sine', [[466, 0], [233, 0.5, true]], 0.6, 0.05);
            break;
          case 'grow':
            tone('square', [[160, 0], [80, 0.3, true]], 0.4, 0.08);
            tone('sine', [[320, 0], [640, 0.2, true]], 0.25, 0.05);
            break;
          case 'break': noise(0.2, 0.14, 900); break;
          case 'exit': tone('sine', [[523, 0], [1047, 0.18, true]], 0.25, 0.08); break;
          case 'error':
            // Klasik sistem hata sesi
            tone('square', [[660, 0]], 0.12, 0.06);
            tone('square', [[440, 0]], 0.18, 0.06, 0.13);
            break;
          case 'close': tone('sine', [[500, 0], [120, 0.15, true]], 0.18, 0.08); break;
          case 'flip':
            tone('sine', [[300, 0], [900, 0.12, true]], 0.16, 0.07);
            tone('sine', [[900, 0], [300, 0.12, true]], 0.16, 0.04, 0.12);
            break;
          case 'chomp':
            noise(0.08, 0.2, 2000);
            tone('square', [[180, 0], [90, 0.08, true]], 0.1, 0.12);
            noise(0.08, 0.2, 2000, null, ac.currentTime + 0.12);
            break;
          case 'ui': tone('sine', [[880, 0]], 0.05, 0.035); break;
        }
      } catch (e) {}
    }
  };
})(window.ZT);
