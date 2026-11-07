/* Zero Trust — bölüm verileri (1920×1080 sanal koordinat sistemi)
 * Metinler burada anahtar olarak durur, çevirisi i18n.js'te.
 * Oyuncu zıplama yüksekliği ≈172px, tek zıplamada yatay menzil ≈320px.
 */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  ZT.LEVEL_COUNT = 5;      // platform bölümleri
  ZT.BONUS_INDEX = 5;      // kaçan buton
  ZT.LEVEL_KEYS = ['l1', 'l2', 'l3', 'l4', 'l5', 'b'];

  const falling = (x, y, w, h, delay) => ({ x, y, w, h, type: 'falling', triggered: false, delay, vy: 0 });
  const solid = (x, y, w, h) => ({ x, y, w, h, type: 'solid' });
  const invisible = (x, y, w, h) => ({ x, y, w, h, type: 'invisible', revealed: false });

  ZT.buildLevel = function (idx) {
    switch (idx) {
      case 0: return {
        key: 'l1',
        spawn: { x: 110, y: 780 },
        platforms: [
          solid(0, 880, 520, 200),
          falling(520, 880, 230, 45, 4),
          solid(750, 880, 460, 200),
          invisible(600, 675, 95, 42),
          solid(1360, 880, 560, 200),
          invisible(1235, 670, 85, 42)
        ],
        spikes: [
          { x: 350, y: 848, w: 70, h: 32, hidden: true, revealed: false, triggerX: 285, triggerDist: 95 },
          { x: 960, y: 848, w: 80, h: 32, hidden: true, revealed: false, triggerX: 880, triggerDist: 100 },
          { x: 520, y: 1045, w: 230, h: 35 },
          { x: 1210, y: 1045, w: 150, h: 35 }
        ],
        signs: [
          { x: 150, y: 810, k: 'l1.s1' },
          { x: 830, y: 810, k: 'l1.s2' }
        ],
        goal: { x: 1620, y: 770, w: 74, h: 110, path: [1790], texts: ['l1.door'] },
        fakeGoals: [],
        reverseZone: null,
        gravityLineX: null,
        ceilingSpikes: []
      };

      case 1: return {
        key: 'l2',
        spawn: { x: 100, y: 780 },
        platforms: [
          solid(0, 880, 460, 200),
          solid(580, 780, 320, 300),
          falling(900, 780, 190, 40, 3),
          solid(1090, 740, 430, 340),
          solid(1620, 650, 300, 430),
          invisible(1515, 470, 90, 40)
        ],
        spikes: [
          { x: 690, y: 748, w: 80, h: 32, hidden: true, revealed: false, triggerX: 620, triggerDist: 95 },
          { x: 1270, y: 708, w: 90, h: 32 },
          { x: 460, y: 1045, w: 1160, h: 35 }
        ],
        signs: [
          { x: 120, y: 810, k: 'l2.s1' },
          { x: 1120, y: 675, k: 'l2.s2' }
        ],
        goal: { x: 1770, y: 540, w: 74, h: 110, path: [1650], texts: ['l2.door'] },
        fakeGoals: [],
        reverseZone: { x: 1090, w: 530 },
        gravityLineX: null,
        ceilingSpikes: []
      };

      case 2: return {
        key: 'l3',
        spawn: { x: 90, y: 800 },
        platforms: [
          solid(0, 890, 620, 190),
          solid(740, 820, 520, 260),
          solid(1380, 820, 540, 260),
          // Üst kata çıkan yol. Eski sürümde ilk basamak 200px yüksekteydi
          // ve zıplama 172px olduğu için bölüm geçilemiyordu.
          solid(1120, 665, 220, 36),
          solid(760, 515, 300, 36),
          solid(320, 380, 350, 36),
          invisible(1390, 610, 90, 40)
        ],
        spikes: [
          { x: 480, y: 858, w: 70, h: 32, slideToX: 290, triggered: false, triggerX: 230 },
          { x: 1120, y: 788, w: 75, h: 32, slideToX: 880, triggered: false, triggerX: 800 },
          { x: 620, y: 1045, w: 120, h: 35 },
          { x: 1260, y: 1045, w: 120, h: 35 }
        ],
        signs: [
          { x: 1395, y: 755, k: 'l3.s1' },
          { x: 770, y: 460, k: 'l3.s2' }
        ],
        goal: { x: 370, y: 270, w: 74, h: 110, path: [], texts: [] },
        fakeGoals: [{ x: 1750, y: 710, w: 74, h: 110 }],
        reverseZone: null,
        gravityLineX: null,
        ceilingSpikes: []
      };

      case 3: return {
        key: 'l4',
        spawn: { x: 100, y: 790 },
        platforms: [
          solid(0, 880, 860, 200),
          solid(760, 80, 780, 90),
          solid(1420, 820, 500, 260)
        ],
        spikes: [
          { x: 430, y: 848, w: 75, h: 32, hidden: true, revealed: false, triggerX: 350, triggerDist: 90 },
          { x: 1120, y: 170, w: 80, h: 32, hidden: true, revealed: false, triggerX: 1030, triggerDist: 100, inverted: true },
          { x: 860, y: 1045, w: 560, h: 35 }
        ],
        signs: [
          { x: 150, y: 810, k: 'l4.s1' },
          { x: 900, y: 240, k: 'l4.s2' }
        ],
        goal: { x: 1760, y: 710, w: 74, h: 110, path: [1520], texts: ['l4.door'] },
        fakeGoals: [],
        reverseZone: null,
        gravityLineX: 810,
        gravityRestoreX: 1460,
        ceilingSpikes: [{ x: 600, y: 80, w: 60, h: 70, vy: 0, triggered: false, triggerX: 540 }]
      };

      case 4: return {
        key: 'l5',
        spawn: { x: 90, y: 790 },
        platforms: [
          solid(0, 880, 380, 200),
          falling(450, 820, 180, 40, 4),
          solid(700, 760, 420, 320),
          falling(1200, 690, 200, 40, 4),
          solid(1470, 640, 450, 440),
          invisible(380, 620, 80, 40)
        ],
        spikes: [
          { x: 980, y: 728, w: 75, h: 32, slideToX: 770, triggered: false, triggerX: 730 },
          { x: 1620, y: 608, w: 70, h: 32, hidden: true, revealed: false, triggerX: 1530, triggerDist: 95 },
          { x: 380, y: 1045, w: 1090, h: 35 }
        ],
        signs: [
          { x: 60, y: 810, k: 'l5.s1' },
          { x: 1500, y: 575, k: 'l5.s2' }
        ],
        // Eski sürümde ikinci kaçış ilkinden 20px uzaktaydı ve aynı karede tetikleniyordu.
        goal: { x: 1800, y: 530, w: 74, h: 110, path: [1500, 1830], texts: ['l5.door1', 'l5.door2'] },
        fakeGoals: [],
        reverseZone: { x: 700, w: 420 },
        gravityLineX: null,
        ceilingSpikes: []
      };
    }
    return null;
  };
})(window.ZT);
