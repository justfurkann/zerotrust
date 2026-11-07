/* Zero Trust — bölümler
 *
 * Izgara: 32 × 18 kare, her kare 60px (1920 × 1080).
 * Oyuncu: 40 × 48. Zıplama ≈ 2.4 kare yükseklik, ≈ 4.5 kare menzil.
 * Kısa basış alçak zıplar (değişken zıplama yüksekliği).
 *
 * Kare tipleri
 *   #  zemin            ~  sahte zemin (görünür, içinden düşersin)
 *   =  çöken kare       f  sahte çöken kare
 *   ?  gizli blok (alttan kafa atınca belirir)
 *   ^  diken (yukarı)   v  diken (aşağı)
 *   x  görünmez tavan dikeni (çarpınca belirir)
 *   S  yay
 *
 * Tuzaklar (ents) oyuncunun merkezinin bir alana girmesiyle tetiklenir.
 * trig: [x, w] → x..x+w sütun aralığı (tüm yükseklik)
 *       [x, y, w, h] → dikdörtgen (kare cinsinden)
 */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  const COLS = 32;
  const ROWS = 18;

  function builder() {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill('.'));
    return {
      g,
      fill(x, y, w, h, ch) {
        for (let j = y; j < y + h; j++)
          for (let i = x; i < x + w; i++)
            if (j >= 0 && j < ROWS && i >= 0 && i < COLS) g[j][i] = ch;
      },
      clear(x, y, w, h) { this.fill(x, y, w, h, '.'); }
    };
  }

  const LEVELS = [
    // 01 — Merhaba: yürü, kapıya git. Zemin açılır, kapı kaçar.
    {
      key: 'l1',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.clear(13, 15, 4, 2);
        b.fill(13, 16, 4, 1, '^');
        return {
          spawn: [2, 13],
          door: { x: 27, y: 13, runs: [[30, 13]], runR: 2.3 },
          ents: [
            { t: 'trapdoor', x: 13, y: 14, w: 4, h: 1, trig: [13.25, 2.5] },
            { t: 'sign', x: 4, y: 13, k: 'l1.s1' }
          ]
        };
      }
    },

    // 02 — Güven: çukurun üstünden atla. İndiğin yerde diken biter.
    // Tavandaki blok koşana göre ayarlı; ikincisi ise hiç zarar vermez.
    {
      key: 'l2',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.clear(9, 14, 3, 2);
        b.fill(9, 16, 3, 1, '^');
        b.fill(16, 0, 11, 2, '#');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'pop', x: 12, y: 13, w: 1, trig: [9, 3] },
            { t: 'drop', x: 21, y: 2, w: 1, h: 1, trig: [17.6, 0.6] },
            { t: 'drop', x: 25, y: 2, w: 1, h: 1, trig: [25.2, 0.6] },
            { t: 'sign', x: 2, y: 13, k: 'l2.s1' }
          ]
        };
      }
    },

    // 03 — Köprü: çöken köprü, ortasında sahte bir tahta.
    // Kapı yüksekte; basamak görünmez, kafanı vurunca belirir.
    {
      key: 'l3',
      build(b) {
        b.fill(0, 14, 9, 4, '#');
        b.fill(9, 14, 12, 1, '=');
        b.fill(15, 14, 1, 1, 'f');
        b.fill(21, 14, 11, 4, '#');
        b.fill(27, 11, 5, 3, '#');
        b.fill(25, 12, 1, 1, '?');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 10 },
          ents: [
            { t: 'sign', x: 1, y: 13, k: 'l3.s1' },
            { t: 'sign', x: 21, y: 13, k: 'l3.s2' }
          ]
        };
      }
    },

    // 04 — Yay: duvarın üstünden uç. Doğal iniş noktası dikenle dolar,
    // havada sağ tuşu bırakıp duvarın dibine inmek gerekir.
    {
      key: 'l4',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(14, 9, 2, 5, '#');
        b.fill(12, 13, 1, 1, 'S');
        return {
          spawn: [2, 13],
          door: { x: 30, y: 13 },
          ents: [
            { t: 'pop', x: 18, y: 13, w: 3, trig: [14, 0, 2, 9] },
            { t: 'slide', x: 28, y: 13, to: 21, speed: 8, trig: [23, 1] },
            { t: 'sign', x: 3, y: 13, k: 'l4.s1' }
          ]
        };
      }
    },

    // 05 — Sessizlik: "tuzak yok". Çukurun üstünde görünmez tavan dikenleri var:
    // tam zıplayan ölür, tuşa kısa basıp alçak zıplayan altından geçer.
    // Kapıya dokununca sahte bir "tamamlandı" ve kapı başa ışınlanır.
    {
      key: 'l5',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.clear(12, 14, 2, 2);
        b.fill(12, 16, 2, 1, '^');
        b.fill(11, 11, 4, 1, 'x');
        return {
          spawn: [3, 13],
          door: { x: 28, y: 13, fakeWin: [1, 13] },
          ents: [
            { t: 'sign', x: 4, y: 13, k: 'l5.s1' }
          ]
        };
      }
    },

    // 06 — Ayna: sütunlar üstünde zıplama. İlk sütuna basınca kontroller
    // kalıcı olarak ters döner (bölge değil, olay — titreme yok).
    {
      key: 'l6',
      build(b) {
        b.fill(0, 14, 10, 4, '#');
        b.fill(10, 17, 15, 1, '#');
        b.fill(10, 16, 15, 1, '^');
        b.fill(12, 13, 2, 3, '#');
        b.fill(17, 13, 1, 3, '#');
        b.fill(21, 13, 2, 3, '#');
        b.fill(25, 14, 7, 4, '#');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'invert', trig: [12.3, 1.4] },
            { t: 'sign', x: 2, y: 13, k: 'l6.s1' }
          ]
        };
      }
    },

    // 07 — Kaçış: zemin arkandan çöküyor. Dur, düşersin.
    {
      key: 'l7',
      build(b) {
        b.fill(0, 14, 3, 4, '#');
        b.fill(3, 14, 29, 1, '=');
        b.fill(10, 13, 1, 1, '^');
        b.fill(16, 13, 1, 1, '^');
        b.fill(21, 12, 1, 2, '=');
        b.fill(26, 13, 1, 1, '^');
        return {
          spawn: [1, 13],
          door: { x: 30, y: 13 },
          ents: [
            { t: 'chase', x0: 3, x1: 31, trig: [3.6, 1], delay: 24, interval: 9 },
            { t: 'sign', x: 0, y: 13, k: 'l7.s1' }
          ]
        };
      }
    },

    // 08 — Son: öğrendiklerin sana karşı. 1. bölümdeki açılan zemine
    // benzeyen yer sağlam; asıl tuzak hemen ötesindeki sahte zemin.
    // Çöken köprü, koşana ayarlı düşen blok, iki kez kaçan kapı.
    {
      key: 'l8',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(11, 14, 3, 1, '~');
        b.clear(11, 15, 3, 1);
        b.fill(11, 16, 3, 1, '^');
        b.clear(16, 14, 6, 4);
        b.fill(16, 14, 6, 1, '=');
        b.fill(18, 0, 8, 2, '#');
        b.fill(24, 12, 3, 2, '#');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13, runs: [[25, 11], [31, 13]], runR: 2.3 },
          ents: [
            { t: 'drop', x: 23, y: 2, w: 1, h: 1, trig: [19.2, 0.6] },
            { t: 'sign', x: 2, y: 13, k: 'l8.s1' }
          ]
        };
      }
    }
  ];

  ZT.COLS = COLS;
  ZT.ROWS = ROWS;
  ZT.LEVEL_COUNT = LEVELS.length;
  ZT.LEVEL_KEYS = LEVELS.map((l) => l.key);

  ZT.buildLevel = function (idx) {
    const def = LEVELS[idx];
    const b = builder();
    const meta = def.build(b);
    return { key: def.key, chars: b.g, spawn: meta.spawn, door: meta.door, ents: meta.ents };
  };
})(window.ZT);
