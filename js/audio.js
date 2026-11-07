/* Zero Trust — ses motoru (Web Audio, dosyasız) */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  let ac = null;
  let master = null;

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.8;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone(type, freqs, dur, vol) {
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.connect(gain);
    gain.connect(master);
    freqs.forEach(([f, at, ramp]) => {
      if (ramp) osc.frequency.exponentialRampToValueAtTime(f, now + at);
      else osc.frequency.setValueAtTime(f, now + at);
    });
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function noise(dur, vol) {
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    gain.gain.value = vol;
    src.start();
  }

  ZT.audio = {
    muted: false,
    unlock() { ensure(); },
    play(kind) {
      if (this.muted) return;
      try {
        if (!ensure()) return;
        switch (kind) {
          case 'jump':
            tone('square', [[220, 0], [440, 0.1, true]], 0.12, 0.05);
            break;
          case 'land':
            tone('sine', [[120, 0], [60, 0.06, true]], 0.07, 0.06);
            break;
          case 'die':
            noise(0.28, 0.22);
            tone('sawtooth', [[240, 0], [60, 0.3, true]], 0.32, 0.09);
            break;
          case 'trap':
            tone('square', [[620, 0], [180, 0.12, true]], 0.14, 0.06);
            break;
          case 'win':
            tone('triangle', [[392, 0], [523, 0.08], [659, 0.16], [784, 0.24]], 0.5, 0.14);
            break;
          case 'ui':
            tone('sine', [[880, 0]], 0.05, 0.035);
            break;
        }
      } catch (e) {}
    }
  };
})(window.ZT);
