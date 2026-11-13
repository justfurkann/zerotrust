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
 *   w  zayıf zemin (sadece devken kırılır)
 *
 * Tuzaklar (ents) oyuncunun merkezinin bir alana girmesiyle tetiklenir.
 * Diğer nesneler: key (anahtar), shy (ürkek platform), ceil (sabırsız tavan),
 * cube (dev küp), hud (düşen başlık), fakeGhost (radarın sahte izi), clone (gölge).
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
    },

    // 09 — Anahtar: kapı kilitli. Anahtarı alınca kapı açılır,
    // ama anahtar yarım saniye sonra dişlerini gösterip seni kovalar.
    {
      key: 'l9',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(13, 13, 2, 1, '^');
        b.fill(20, 13, 1, 1, '^');
        b.fill(27, 12, 4, 2, '#');
        return {
          spawn: [6, 13],
          door: { x: 2, y: 13, locked: true },
          ents: [
            { t: 'key', x: 29, y: 11, hostile: true, delay: 30, speed: 5.2 },
            { t: 'sign', x: 8, y: 13, k: 'l9.s1' }
          ]
        };
      }
    },

    // 10 — Ürkek: platformlar zıpladığın an kaçıyor. Üçüncüsü ise
    // sana doğru geliyor; sağ tuşu basılı tutan karşıya uçup düşer.
    {
      key: 'l10',
      build(b) {
        b.fill(0, 14, 6, 4, '#');
        b.fill(26, 14, 6, 4, '#');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'shy', x: 9, y: 14, w: 2, dx: 80, trig: [3, 3.6] },
            { t: 'shy', x: 15, y: 14, w: 2, dx: 100, trig: [8.5, 4] },
            { t: 'shy', x: 21, y: 14, w: 2, dx: -60, trig: [14.5, 5] },
            { t: 'sign', x: 0, y: 13, k: 'l10.s1' }
          ]
        };
      }
    },

    // 11 — Sabır: 2. ve 8. bölüm beklemeyi öğretti. Burada tavan sabırsız:
    // 2 saniye ilerlemezsen iner. Düşen blok koşanı ıskalar, bekleyeni ezer.
    // Kayan diken duvardan seker ve 1.5 kat hızla arkandan geri gelir.
    {
      key: 'l11',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        return {
          spawn: [2, 13],
          door: { x: 28, y: 13 },
          ents: [
            { t: 'ceil', bottom: 5, warn: 80, slam: 115, start: 45 },
            { t: 'drop', x: 10, y: 5, w: 1, h: 1, trig: [9.6, 0.5] },
            { t: 'slide', x: 20, y: 13, to: 12, back: 30, speed: 8, trig: [16, 1] },
            { t: 'sign', x: 3, y: 13, k: 'l11.s1' }
          ]
        };
      }
    },

    // 12 — İksir: köprünün ortasındaki parlak küp seni devleştirir,
    // ağırlığınla köprü kırılır. Onu atla; ikinci küpü al, duvarı yık.
    {
      key: 'l12',
      build(b) {
        b.fill(0, 14, 8, 4, '#');
        b.fill(8, 14, 12, 1, 'w');
        b.fill(20, 14, 12, 4, '#');
        b.fill(25, 10, 1, 4, 'w');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'cube', x: 13, y: 13 },
            { t: 'cube', x: 22, y: 13 },
            { t: 'sign', x: 2, y: 13, k: 'l12.s1' }
          ]
        };
      }
    },

    // 13 — Başlığa Güvenme: sol üstteki bölüm başlığı aslında sahnenin parçası,
    // altından geçerken düşer. Radar açıksa, bir kez yalan söyler.
    {
      key: 'l13',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        return {
          spawn: [28, 13],
          door: { x: 1, y: 13 },
          ents: [
            { t: 'pop', x: 8, y: 13, w: 2, trig: [11.5, 3.5], radarHide: true },
            { t: 'fakeGhost', x: 12, y: 13, w: 2 },
            { t: 'hud', trig: [0, 6.2] },
            { t: 'sign', x: 21, y: 13, k: 'l13.s1' }
          ]
        };
      }
    },

    // 14 — Gölge: bir saniye arkandan seni birebir taklit eden bir gölge var.
    // Durursan ya da geri dönersen ona çarparsın. Önceki derslerin hepsi burada.
    {
      key: 'l14',
      build(b) {
        b.fill(0, 14, 7, 4, '#');
        b.fill(7, 14, 6, 1, '=');
        b.fill(13, 14, 6, 4, '#');
        b.fill(15, 13, 1, 1, '^');
        b.fill(22, 14, 10, 4, '#');
        b.fill(19, 17, 3, 1, '#');
        b.fill(19, 16, 3, 1, '^');
        b.fill(23, 0, 8, 2, '#');
        return {
          spawn: [2, 13],
          door: { x: 30, y: 13 },
          ents: [
            { t: 'clone', start: 90, delay: 60 },
            { t: 'pop', x: 22, y: 13, w: 1, trig: [19, 3] },
            { t: 'drop', x: 28, y: 2, w: 1, h: 1, trig: [24.6, 0.6] },
            { t: 'sign', x: 0, y: 13, k: 'l14.s1' }
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
