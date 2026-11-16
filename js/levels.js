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
 *   c  çatlak duvar (sağlam görünür, içinden geçilir; gizli geçit)
 *
 * Tuzaklar (ents) oyuncunun merkezinin bir alana girmesiyle tetiklenir.
 * Diğer nesneler: key (anahtar), shy (ürkek platform), ceil (sabırsız tavan),
 * cube (dev küp), hud (düşen başlık), fakeGhost (radarın sahte izi), clone (gölge),
 * window (sahte hata penceresi), gflip (zıplayınca yerçekimi dönen alan),
 * decoy (sahte kapı), revenge (önceki ölüm noktaları tuzağa döner).
 * Perde IV nesneleri: cp (kayıt noktası; fake: patlar), btn (düğme; timed: süreli,
 * hold: basılıyken, ceil: tavanda), gate (kapı; id / ids, latch: açılınca kalır,
 * inv: basınca kapanır), mover (hareketli platform; drop: fazla durursan düşer),
 * laser (on / off / phase tick cinsinden ritim).
 * Bölüm tanımında cols verilirse bölüm 32 kareden geniştir ve kamera kayar.
 * trig: [x, w] → x..x+w sütun aralığı (tüm yükseklik)
 *       [x, y, w, h] → dikdörtgen (kare cinsinden)
 */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  const COLS = 32;
  const ROWS = 18;

  function builder(cols) {
    const COLS = cols;
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
    },

    // 15 — Hata: çukur atlanamayacak kadar geniş. Yaklaşınca "bağlantı kesildi"
    // penceresi açılır; pencere bir platformdur. Sağ üstteki ×'e değersen kapanır.
    {
      key: 'l15',
      build(b) {
        b.fill(0, 14, 10, 4, '#');
        b.fill(18, 14, 14, 4, '#');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'window', x: 10, y: 12, w: 7, h: 2, trig: [7.5, 2] },
            { t: 'sign', x: 2, y: 13, k: 'l15.s1' }
          ]
        };
      }
    },

    // 16 — Takla: zemin baştan sona diken. Mavi alanda zıplarsan yerçekimi döner,
    // tavanda yürüyüp ikinci alanda geri dönersin.
    {
      key: 'l16',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(0, 0, 32, 3, '#');
        b.fill(9, 13, 15, 1, '^');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'gflip', trig: [5, 0, 3, 18] },
            { t: 'gflip', trig: [25, 0, 3, 18] },
            { t: 'sign', x: 0, y: 13, k: 'l16.s1' }
          ]
        };
      }
    },

    // 17 — Tavan Arası: tavanda da tuzak var. Tavandan biten diken,
    // sabit diken ve basınca yukarı "düşürdüğü" sahte tavan.
    {
      key: 'l17',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(0, 0, 32, 3, '#');
        b.fill(7, 13, 19, 1, '^');
        b.fill(18, 3, 1, 1, 'v');
        b.fill(21, 0, 2, 3, '~');
        return {
          spawn: [1, 13],
          door: { x: 30, y: 13 },
          ents: [
            { t: 'gflip', trig: [3, 0, 3, 18] },
            { t: 'pop', x: 13, y: 3, w: 1, down: true, trig: [10.5, 1.5] },
            { t: 'gflip', trig: [26, 0, 3, 18] },
            { t: 'sign', x: 6, y: 13, k: 'l17.s1' }
          ]
        };
      }
    },

    // 18 — Sahte Kapı: sağdaki kapı seni yer. Gerçek çıkış, başlangıcın
    // solundaki duvarın içinde; duvarda ince çatlaklar var.
    {
      key: 'l18',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(0, 0, 3, 9, '#');
        b.fill(0, 9, 3, 5, 'c');
        return {
          spawn: [5, 13],
          door: { x: 1, y: 13 },
          ents: [
            { t: 'decoy', x: 28, y: 13 },
            { t: 'pop', x: 15, y: 13, w: 1, trig: [12, 2] },
            { t: 'sign', x: 6, y: 13, k: 'l18.s1' }
          ]
        };
      }
    },

    // 19 — İntikam: öldüğün noktalar sonraki denemede dikenli topa dönüşür.
    // Alt ve üst olmak üzere iki yol var; ölümler rotanı değiştirmeye zorlar.
    {
      key: 'l19',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(7, 13, 2, 1, '^');
        b.fill(14, 13, 2, 1, '^');
        b.fill(21, 13, 2, 1, '^');
        // Üst yol: her platform bir öncekine tek zıplamayla ulaşılır
        b.fill(5, 12, 4, 1, '#');
        b.fill(12, 11, 4, 1, '#');
        b.fill(19, 11, 4, 1, '#');
        b.fill(25, 12, 3, 1, '#');
        return {
          spawn: [2, 13],
          door: { x: 30, y: 13 },
          ents: [
            { t: 'revenge', max: 4 },
            { t: 'pop', x: 10, y: 13, w: 1, trig: [7, 2] },
            { t: 'pop', x: 17, y: 13, w: 1, trig: [14, 2] },
            { t: 'sign', x: 2, y: 13, k: 'l19.s1' }
          ]
        };
      }
    },

    // 20 — Kaçak: ürkek platformlar + gölge. Platformda bir saniyeden uzun
    // bekleyemezsin; ikincisi sana doğru gelir.
    {
      key: 'l20',
      build(b) {
        b.fill(0, 14, 6, 4, '#');
        b.fill(25, 14, 7, 4, '#');
        return {
          spawn: [2, 13],
          door: { x: 29, y: 13 },
          ents: [
            { t: 'clone', start: 60, delay: 60 },
            { t: 'shy', x: 9, y: 14, w: 2, dx: 80, trig: [3, 3.6] },
            { t: 'shy', x: 15, y: 14, w: 2, dx: -80, trig: [9.5, 3.5] },
            { t: 'shy', x: 19, y: 14, w: 2, dx: 60, trig: [13, 3.5] },
            { t: 'sign', x: 0, y: 13, k: 'l20.s1' }
          ]
        };
      }
    },

    // 21 — Ağır Abi: tahta köprü boşluğun üstünde. Boşlukların üstünde tam
    // zıplamanın tepesine denk gelen küpler var; alçak zıplayan altından geçer.
    {
      key: 'l21',
      build(b) {
        b.fill(0, 14, 4, 4, '#');
        b.fill(4, 14, 24, 1, 'w');
        b.clear(9, 14, 2, 1);
        b.clear(16, 14, 2, 1);
        b.clear(23, 14, 2, 1);
        b.fill(28, 14, 4, 4, '#');
        return {
          spawn: [1, 13],
          door: { x: 30, y: 13 },
          ents: [
            { t: 'cube', x: 9.5, y: 10.5 },
            { t: 'cube', x: 16.5, y: 10.5 },
            { t: 'cube', x: 23.5, y: 10.5 },
            { t: 'sign', x: 0, y: 13, k: 'l21.s1' }
          ]
        };
      }
    },

    // 22 — Telaş: kilitli kapı, kovalayan anahtar ve yerinde durunca inen tavan.
    // Anahtarı alıp geri dönerken bir an bile duramazsın.
    {
      key: 'l22',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(10, 13, 1, 1, '^');
        b.fill(19, 13, 1, 1, '^');
        return {
          spawn: [5, 13],
          door: { x: 2, y: 13, locked: true },
          ents: [
            { t: 'ceil', bottom: 5, warn: 70, slam: 105, start: 30 },
            { t: 'key', x: 28, y: 13, hostile: true, delay: 30, speed: 5.2 },
            { t: 'sign', x: 6, y: 13, k: 'l22.s1' }
          ]
        };
      }
    },

    // 23 — Tersyüz: anahtar tavanda, zemin dikenli. Yukarı dön, anahtarı al,
    // kovalanırken aynı alanda aşağı dön ve kapıya koş.
    {
      key: 'l23',
      build(b) {
        b.fill(0, 14, 32, 4, '#');
        b.fill(0, 0, 32, 3, '#');
        b.fill(12, 13, 13, 1, '^');
        return {
          spawn: [5, 13],
          door: { x: 2, y: 13, locked: true },
          ents: [
            { t: 'gflip', trig: [8, 0, 3, 18] },
            { t: 'key', x: 27, y: 3, hostile: true, delay: 30, speed: 5 },
            { t: 'sign', x: 3, y: 13, k: 'l23.s1' }
          ]
        };
      }
    },

    // 24 — Sıfır Güven: hata penceresi köprüsü, sahte kapı, alçak sütunun içindeki
    // gerçek çıkış ve arkandaki gölge. Her şeyi biliyorsun; yine de güvenme.
    {
      key: 'l24',
      build(b) {
        b.fill(0, 14, 8, 4, '#');
        b.fill(15, 14, 17, 4, '#');
        b.fill(21, 12, 3, 2, 'c');
        return {
          spawn: [2, 13],
          door: { x: 22, y: 13 },
          ents: [
            { t: 'clone', start: 60, delay: 60 },
            { t: 'window', x: 8, y: 12, w: 6, h: 2, trig: [5.5, 2] },
            { t: 'decoy', x: 29, y: 13 },
            { t: 'sign', x: 0, y: 13, k: 'l24.s1' }
          ]
        };
      }
    },
    // ───────────── Perde IV: uzun, çok aşamalı bölümler (kamera kayar) ─────────────

    // 25 — Uzun Yol: düğme + kapı, hareketli platform, sahte kayıt noktası, süreli kapı.
    // "Basma" denen düğmeye basmak şart ama bastığın an önünde diken biter.
    {
      key: 'l25',
      cols: 64,
      build(b) {
        b.fill(0, 14, 64, 4, '#');
        b.fill(20, 0, 1, 10, '#');
        b.clear(27, 14, 13, 2);
        b.fill(27, 16, 13, 1, '^');
        b.fill(35, 14, 2, 1, '=');
        b.fill(50, 13, 1, 1, '^');
        b.fill(54, 13, 1, 1, '^');
        b.fill(58, 0, 1, 10, '#');
        return {
          spawn: [2, 13],
          door: { x: 61, y: 13 },
          ents: [
            { t: 'sign', x: 3, y: 13, k: 'l25.s1' },
            { t: 'btn', x: 9, y: 13, id: 1 },
            { t: 'pop', x: 11, y: 13, w: 2, trig: [9.2, 0.8] },
            { t: 'gate', x: 20, y: 10, h: 4, id: 1 },
            { t: 'cp', x: 23, y: 13, id: 1 },
            { t: 'mover', x: 27, y: 14, w: 3, to: [30, 14], speed: 2.5, wait: 20 },
            { t: 'sign', x: 39, y: 13, k: 'l25.s2' },
            { t: 'cp', x: 42, y: 13, fake: true },
            { t: 'cp', x: 44, y: 13, id: 2 },
            { t: 'btn', x: 46, y: 13, id: 2, timed: 150 },
            { t: 'gate', x: 58, y: 10, h: 4, id: 2 }
          ]
        };
      }
    },

    // 26 — Gidiş Dönüş: kapı başta, anahtar en sonda. Lazerler, uzun bir platform
    // yolculuğu ve tek kullanımlık köprü. Köprüyü giderken harcarsan dönüşte,
    // anahtar peşindeyken platformu beklemek zorunda kalırsın.
    {
      key: 'l26',
      cols: 64,
      build(b) {
        b.fill(0, 14, 64, 4, '#');
        b.clear(26, 14, 13, 2);
        b.fill(26, 16, 13, 1, '^');
        b.fill(42, 12, 2, 2, '#');
        b.fill(26, 12, 14, 1, '=');
        return {
          spawn: [5, 13],
          door: { x: 2, y: 13, locked: true },
          ents: [
            { t: 'sign', x: 6, y: 13, k: 'l26.s1' },
            { t: 'laser', x: 12, y: 0, len: 14, dir: 'v', on: 45, off: 75, phase: 0 },
            { t: 'laser', x: 18, y: 0, len: 14, dir: 'v', on: 45, off: 75, phase: 40 },
            { t: 'cp', x: 22, y: 13, id: 1 },
            { t: 'mover', x: 26, y: 14, w: 3, to: [36, 14], speed: 3, wait: 30 },
            { t: 'laser', x: 32, y: 13, len: 1, dir: 'v', on: 40, off: 80, phase: 20 },
            { t: 'sign', x: 45, y: 13, k: 'l26.s2' },
            { t: 'key', x: 60, y: 13, hostile: true, delay: 30, speed: 5.6 }
          ]
        };
      }
    },

    // 27 — Çift Mesai: kapılar iki düğmeye aynı anda basılınca açılır. İkinci kişi
    // bir buçuk saniye arkandan gelen gölgen. Onu kullan ama ona dokunma.
    {
      key: 'l27',
      cols: 64,
      build(b) {
        b.fill(0, 14, 64, 4, '#');
        b.fill(21, 0, 1, 10, '#');
        b.fill(31, 13, 2, 1, '^');
        b.fill(41, 0, 1, 10, '#');
        b.fill(55, 0, 1, 10, '#');
        return {
          spawn: [2, 13],
          door: { x: 60, y: 13, runs: [[56, 13]], runR: 2 },
          ents: [
            { t: 'clone', start: 60, delay: 90 },
            { t: 'sign', x: 3, y: 13, k: 'l27.s1' },
            { t: 'btn', x: 10, y: 13, id: 1, hold: true },
            { t: 'btn', x: 15, y: 13, id: 2, hold: true },
            { t: 'gate', x: 21, y: 10, h: 4, ids: [1, 2], latch: true },
            { t: 'cp', x: 24, y: 13, id: 1 },
            { t: 'btn', x: 28, y: 13, id: 3, hold: true },
            { t: 'btn', x: 36, y: 13, id: 4, hold: true },
            { t: 'gate', x: 41, y: 10, h: 4, ids: [3, 4], latch: true },
            { t: 'cp', x: 44, y: 13, id: 2 },
            { t: 'sign', x: 45, y: 13, k: 'l27.s2' },
            { t: 'btn', x: 49, y: 13, id: 5, hold: true },
            { t: 'gate', x: 55, y: 10, h: 4, id: 5 }
          ]
        };
      }
    },

    // 28 — Ters Vardiya: süreli düğme tavandaki kapıyı açar; yerçekimini çevirip
    // süre bitmeden geçmelisin. Tavandaki düğme ise zemindeki kapıyı açar.
    // İkinci yarıda zemin ve tavan sırayla kapalı, ortadan lazer geçiyor.
    {
      key: 'l28',
      cols: 64,
      build(b) {
        b.fill(0, 14, 64, 4, '#');
        b.fill(0, 0, 64, 3, '#');
        b.fill(12, 13, 7, 1, '^');
        b.fill(20, 13, 4, 1, '^');
        b.fill(30, 3, 3, 1, 'v');
        b.fill(42, 13, 8, 1, '^');
        b.fill(54, 3, 2, 1, 'v');
        return {
          spawn: [2, 13],
          door: { x: 60, y: 13 },
          ents: [
            { t: 'sign', x: 1, y: 13, k: 'l28.s1' },
            { t: 'btn', x: 5, y: 13, id: 1, timed: 160 },
            { t: 'gflip', trig: [8, 0, 3, 18] },
            { t: 'gate', x: 19, y: 3, h: 11, id: 1 },
            { t: 'btn', x: 23, y: 3, id: 2, ceil: true },
            { t: 'gflip', trig: [25, 0, 3, 18] },
            { t: 'cp', x: 31, y: 13, id: 1 },
            { t: 'gate', x: 33, y: 3, h: 11, id: 2 },
            { t: 'btn', x: 37, y: 13, id: 3, timed: 270 },
            { t: 'gflip', trig: [39, 0, 3, 18] },
            { t: 'laser', x: 39, y: 8, len: 14, dir: 'h', on: 50, off: 50, phase: 0 },
            { t: 'gflip', trig: [50, 0, 3, 18] },
            { t: 'gate', x: 57, y: 3, h: 11, id: 3 }
          ]
        };
      }
    },

    // 29 — Makine Dairesi: boşluğun üstünde üç platform (yatay, asansör, çapraz ve
    // fazla beklersen düşen), sonra arkandan çöken köprüde iki lazerin ritmi,
    // en sonda yaylar ve duvarın üstüne kaçan kapı.
    {
      key: 'l29',
      cols: 80,
      build(b) {
        b.fill(0, 14, 8, 4, '#');
        b.fill(23, 10, 4, 1, '#');
        b.fill(36, 14, 10, 4, '#');
        b.fill(46, 14, 14, 1, '=');
        b.fill(60, 14, 20, 4, '#');
        b.fill(68, 9, 2, 5, '#');
        b.fill(65, 13, 1, 1, 'S');
        b.fill(72, 13, 1, 1, 'S');
        return {
          spawn: [2, 13],
          door: { x: 76, y: 13, runs: [[69, 8]], runR: 2.2 },
          ents: [
            { t: 'sign', x: 1, y: 13, k: 'l29.s1' },
            { t: 'mover', x: 8, y: 14, w: 3, to: [13, 14], speed: 2.5, wait: 10 },
            { t: 'mover', x: 18, y: 14, w: 3, to: [18, 9], speed: 2, wait: 25 },
            { t: 'mover', x: 28, y: 10, w: 3, to: [33, 13], speed: 2.5, wait: 30, drop: 75 },
            { t: 'cp', x: 38, y: 13, id: 1 },
            { t: 'sign', x: 39, y: 13, k: 'l29.s2' },
            { t: 'chase', x0: 46, x1: 59, trig: [45.7, 1], delay: 10, interval: 9 },
            { t: 'laser', x: 50, y: 0, len: 14, dir: 'v', on: 30, off: 60, phase: 0 },
            { t: 'laser', x: 55, y: 0, len: 14, dir: 'v', on: 30, off: 60, phase: 20 },
            { t: 'cp', x: 62, y: 13, id: 2 },
            { t: 'slide', x: 78, y: 13, to: 70, speed: 7, trig: [73, 1] }
          ]
        };
      }
    },

    // 30 — Son Mesai: hepsi bir arada, gidiş ve dönüş. Kapı başta, anahtar en sonda.
    // Bu sefer "basma" denen düğmeye gerçekten basılmaz (dönüşte de). Köprü dönüş için.
    {
      key: 'l30',
      cols: 96,
      build(b) {
        b.fill(0, 14, 96, 4, '#');
        b.fill(0, 0, 96, 3, '#');
        b.fill(15, 3, 1, 7, '#');
        // Platform çukuru ve üstündeki tek kullanımlık köprü
        b.clear(20, 14, 9, 2);
        b.fill(20, 16, 9, 1, '^');
        b.fill(31, 12, 2, 2, '#');
        b.fill(20, 12, 9, 1, '=');
        // Yerçekimi bölümü
        b.fill(44, 13, 11, 1, '^');
        b.fill(78, 3, 1, 7, '#');
        return {
          spawn: [6, 13],
          door: { x: 3, y: 13, locked: true },
          ents: [
            { t: 'sign', x: 7, y: 13, k: 'l30.s1' },
            { t: 'btn', x: 11, y: 13, id: 1, timed: 300 },
            { t: 'gate', x: 15, y: 10, h: 4, id: 1, inv: true },
            { t: 'mover', x: 20, y: 14, w: 3, to: [26, 14], speed: 3, wait: 25 },
            { t: 'laser', x: 24, y: 13, len: 1, dir: 'v', on: 35, off: 85, phase: 30 },
            { t: 'cp', x: 35, y: 13, fake: true },
            { t: 'cp', x: 38, y: 13, id: 1 },
            { t: 'gflip', trig: [41, 0, 3, 18] },
            { t: 'pop', x: 49, y: 3, w: 1, down: true, trig: [46.5, 0, 1.5, 7] },
            { t: 'gflip', trig: [55, 0, 3, 18] },
            { t: 'cp', x: 60, y: 13, id: 2 },
            { t: 'btn', x: 64, y: 13, id: 3, timed: 230 },
            { t: 'laser', x: 68, y: 3, len: 11, dir: 'v', on: 35, off: 65, phase: 0 },
            { t: 'laser', x: 73, y: 3, len: 11, dir: 'v', on: 35, off: 65, phase: 50 },
            { t: 'gate', x: 78, y: 10, h: 4, id: 3 },
            { t: 'btn', x: 82, y: 13, id: 3, timed: 230 },
            { t: 'sign', x: 84, y: 13, k: 'l30.s2' },
            { t: 'key', x: 91, y: 13, hostile: true, delay: 30, speed: 5.4 }
          ]
        };
      }
    }
  ];

  ZT.COLS = COLS;
  ZT.ROWS = ROWS;
  ZT.LEVEL_COUNT = LEVELS.length;
  ZT.LEVEL_KEYS = LEVELS.map((l) => l.key);

  // Perdeler: bölüm seçiminde gruplama ve sahnenin arka plan tonu
  ZT.CHAPTERS = [
    { key: 'ch1', from: 0, to: 7, tint: [200, 255, 61] },
    { key: 'ch2', from: 8, to: 15, tint: [79, 209, 255] },
    { key: 'ch3', from: 16, to: 23, tint: [167, 139, 250] },
    { key: 'ch4', from: 24, to: 29, tint: [255, 122, 92] }
  ];
  ZT.chapterOf = (idx) => Math.max(0, ZT.CHAPTERS.findIndex((c) => idx >= c.from && idx <= c.to));

  ZT.buildLevel = function (idx) {
    const def = LEVELS[idx];
    const cols = def.cols || COLS;
    const b = builder(cols);
    const meta = def.build(b);
    return { key: def.key, cols, chars: b.g, spawn: meta.spawn, door: meta.door, ents: meta.ents };
  };
})(window.ZT);
