/* Zero Trust — dil dosyası (TR / EN) */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  const STRINGS = {
    tr: {
      'tagline': 'Hiçbir şeye güvenme.',
      'menu.play': 'Oyna',
      'menu.continue': 'Devam Et',
      'menu.levels': 'Bölümler',
      'menu.settings': 'Ayarlar',
      'menu.deaths': 'Toplam ölüm',
      'controls.short': 'A D / ← → hareket · W / Space zıpla · R yeniden · Esc duraklat',

      'back': 'Geri',
      'levels.title': 'Bölüm Seç',
      'levels.locked': 'Kilitli',
      'levels.cleared': 'Tamamlandı',
      'levels.open': 'Açık',
      'levels.bonus': 'Bonus',
      'levels.level': 'Bölüm',

      'settings.title': 'Ayarlar',
      'settings.lang': 'Dil',
      'settings.sound': 'Ses',
      'settings.radar': 'Tuzak Radarı',
      'settings.radarDesc': 'Gizli tuzakları gösterir. Açıkçası hile.',
      'settings.fullscreen': 'Tam ekran',
      'settings.fullscreenDesc': 'Kısayol: F',
      'settings.reset': 'İlerlemeyi sıfırla',
      'settings.resetBtn': 'Sıfırla',
      'settings.resetConfirm': 'Emin misin?',
      'settings.resetDone': 'Sıfırlandı',
      'settings.controls': 'Kontroller',
      'on': 'Açık',
      'off': 'Kapalı',

      'ctl.move': 'Hareket',
      'ctl.jump': 'Zıpla',
      'ctl.restart': 'Yeniden başla',
      'ctl.pause': 'Duraklat',

      'pause.title': 'Duraklatıldı',
      'pause.resume': 'Devam',
      'pause.restart': 'Yeniden Başla',
      'pause.levels': 'Bölümler',
      'pause.settings': 'Ayarlar',
      'pause.menu': 'Ana Menü',

      'hud.deaths': 'Ölüm',
      'hud.hint': 'İpucu',
      'hud.radar': 'Radar',

      'end.kicker': 'Oyun bitti',
      'end.title': 'Hiçbir şeye güvenmemeyi öğrendin.',
      'end.sub': 'Toplam ölüm: {n}',
      'end.menu': 'Ana Menü',

      'door.exit': 'ÇIKIŞ',
      'door.reward': 'ÖDÜL',
      'door.fake': 'SAHTE',
      'zone.reverse': '⇄ TERS KONTROL',
      'zone.gravity': 'YERÇEKİMİ',
      'zone.gravityBack': 'NORMAL',
      'block.troll': 'TROL',
      'block.falling': 'DÜŞER',

      'l1.title': 'Masum Başlangıç',
      'l1.hint': 'Düşen köprü, görünmez blok ve kaçan kapıya dikkat.',
      'l1.s1': 'Dümdüz yürü, tuzak yok valla →',
      'l1.s2': 'Köprü sağlamdı di mi?',
      'l1.door': 'Hop! Kapı biraz sağa kaydı.',

      'l2.title': 'Yalancı Tabela',
      'l2.hint': 'Mor bölgede sol ve sağ yer değiştirir.',
      'l2.s1': 'Mor bölgede tuşlar ters çalışır.',
      'l2.s2': 'Sol = Sağ. Beynin yandı mı?',
      'l2.door': 'Kapı arkana geçti knk.',

      'l3.title': 'Altın Kapı',
      'l3.hint': 'Altın kapıya kanma. Gerçek çıkış üst katta.',
      'l3.s1': 'Altın kapı = bedava ödül',
      'l3.s2': 'Gerçek kapı solda. Dikkatli atla.',

      'l4.title': 'Yerçekimi İhaneti',
      'l4.hint': 'Mavi lazeri geçince tavanda yürürsün.',
      'l4.s1': 'Mavi çizgiyi geçince tavana uçarsın.',
      'l4.s2': 'Tavanda yürümek de ayrı dert.',
      'l4.door': 'Kapı: "Yakalayamazsın beni!"',

      'l5.title': 'Sabır Taşı',
      'l5.hint': 'Düşen taşlar, ters kontrol, kayan diken. Kapı iki kez kaçar.',
      'l5.s1': 'Son bölüm. Bunu geçen bordo berelidir.',
      'l5.s2': 'Kapıya dokununca hemen sevinme.',
      'l5.door1': 'Şaka şaka. Bir daha yakala.',
      'l5.door2': 'Bir kere daha. Son, söz.',

      'b.title': 'Kaçan Buton',
      'b.hint': 'Beşinci denemede yoruluyor.',

      'ev.invisible': 'Görünmez blok. Kafan acıdı mı?',
      'ev.bridge': 'Köprü çöküyor, koş!',
      'ev.reverse': 'Ters kontrol. Sol artık sağ.',
      'ev.gravFlip': 'Yerçekimi ters döndü.',
      'ev.gravBack': 'Yerçekimi normale döndü.',
      'ev.ceiling': 'Tavandan diken geliyor!',
      'ev.slide': 'Diken sana doğru kayıyor!',
      'ev.levelDone': 'Bölüm {n} bitti. Sıradaki daha beter.',
      'ev.allDone': '5 bölüm bitti. Şimdi bonus.',
      'ev.radarOn': 'Tuzak radarı açık. Ayıp ama olsun.',
      'ev.radarOff': 'Tuzak radarı kapalı.',

      'die.ceiling': 'Kafana diken düştü.',
      'die.hidden': 'Gizli dikene afiyetle oturdun.',
      'die.spike': 'Dikene kafa attın, tebrikler.',
      'die.fake': 'Altın kapıya kandın. Bedava peynir fare kapanında olur.',
      'die.void': 'Boşluğa uçtun. Kanatların yok, unutma.',

      'troll': [
        'Klavyeyi kırma knk, daha yeni başladık.',
        'O diken hep oradaydı. Sen bakmadın.',
        'Reflekslerin hâlâ yükleniyor.',
        'Az kalsın geçiyordun... Şaka, yaklaşamadın bile.',
        'Tuzak değil knk, tamamen fizik kuralları.',
        'Mouse\'a vurma, onun bir suçu yok.',
        'Bence bu sefer kesin geçersin. (Geçemezsin.)',
        'Sabır taşı olsan şimdiye çatlamıştın.',
        'Geliştirici şu an ekrana bakıp gülüyor.',
        'Zıplama tuşunun çalıştığından emin misin?',
        'Bi su iç gel, bekleriz.',
        'O görünmez bloğu oraya kim koydu ya?'
      ],

      'bonus.title': 'KAÇAN BUTON',
      'bonus.start': 'Ödülü almak için butona 5 kez tıkla. Yakalayabilirsen.',
      'bonus.btn': 'ÖDÜLÜ AL',
      'bonus.fake': 'BURAYA TIKLA',
      'bonus.count': '{c} / {t} yakalandı · {d} kaçış',
      'bonus.hit': 'Helal. {c}/{t}, devam.',
      'bonus.fakeHit': 'Sahte butona bastın. Sayaç sıfırlandı.',
      'bonus.taunts': [
        'Mouse yaşlandı mı knk?',
        'Yakalayamazsın ki.',
        'Hop, buradayım.',
        'Sahte butonlara basma sakın.'
      ],

      'mobile.title': 'Zero Trust sadece bilgisayarda oynanır.',
      'mobile.sub': 'Klavye lazım. Lütfen PC\'den gir.'
    },

    en: {
      'tagline': 'Trust nothing.',
      'menu.play': 'Play',
      'menu.continue': 'Continue',
      'menu.levels': 'Levels',
      'menu.settings': 'Settings',
      'menu.deaths': 'Total deaths',
      'controls.short': 'A D / ← → move · W / Space jump · R restart · Esc pause',

      'back': 'Back',
      'levels.title': 'Select Level',
      'levels.locked': 'Locked',
      'levels.cleared': 'Cleared',
      'levels.open': 'Open',
      'levels.bonus': 'Bonus',
      'levels.level': 'Level',

      'settings.title': 'Settings',
      'settings.lang': 'Language',
      'settings.sound': 'Sound',
      'settings.radar': 'Trap Radar',
      'settings.radarDesc': 'Reveals hidden traps. Honestly, it\'s cheating.',
      'settings.fullscreen': 'Fullscreen',
      'settings.fullscreenDesc': 'Shortcut: F',
      'settings.reset': 'Reset progress',
      'settings.resetBtn': 'Reset',
      'settings.resetConfirm': 'Are you sure?',
      'settings.resetDone': 'Done',
      'settings.controls': 'Controls',
      'on': 'On',
      'off': 'Off',

      'ctl.move': 'Move',
      'ctl.jump': 'Jump',
      'ctl.restart': 'Restart',
      'ctl.pause': 'Pause',

      'pause.title': 'Paused',
      'pause.resume': 'Resume',
      'pause.restart': 'Restart',
      'pause.levels': 'Levels',
      'pause.settings': 'Settings',
      'pause.menu': 'Main Menu',

      'hud.deaths': 'Deaths',
      'hud.hint': 'Hint',
      'hud.radar': 'Radar',

      'end.kicker': 'Game over',
      'end.title': 'You learned to trust nothing.',
      'end.sub': 'Total deaths: {n}',
      'end.menu': 'Main Menu',

      'door.exit': 'EXIT',
      'door.reward': 'REWARD',
      'door.fake': 'FAKE',
      'zone.reverse': '⇄ INVERTED',
      'zone.gravity': 'GRAVITY',
      'zone.gravityBack': 'NORMAL',
      'block.troll': 'TROLL',
      'block.falling': 'FALLS',

      'l1.title': 'Innocent Start',
      'l1.hint': 'Watch for the falling bridge, invisible blocks and the runaway door.',
      'l1.s1': 'Just walk straight, no traps, promise →',
      'l1.s2': 'That bridge was solid, right?',
      'l1.door': 'Oops! The door moved a little.',

      'l2.title': 'Lying Signs',
      'l2.hint': 'In the purple zone, left and right swap.',
      'l2.s1': 'Keys are reversed in the purple zone.',
      'l2.s2': 'Left = Right. Brain melting yet?',
      'l2.door': 'The door is behind you now.',

      'l3.title': 'The Golden Door',
      'l3.hint': 'Don\'t trust the golden door. The real exit is upstairs.',
      'l3.s1': 'Golden door = free reward',
      'l3.s2': 'The real door is left. Jump carefully.',

      'l4.title': 'Gravity Betrayal',
      'l4.hint': 'Past the blue laser, you walk on the ceiling.',
      'l4.s1': 'Cross the blue line and you\'ll fly up.',
      'l4.s2': 'Walking on the ceiling is its own problem.',
      'l4.door': 'Door: "You can\'t catch me!"',

      'l5.title': 'Last Nerve',
      'l5.hint': 'Falling blocks, inverted controls, a sliding spike. The door runs twice.',
      'l5.s1': 'Final level. Only legends make it.',
      'l5.s2': 'Don\'t celebrate when you reach the door.',
      'l5.door1': 'Just kidding. Catch me again.',
      'l5.door2': 'One more time. Last one, promise.',

      'b.title': 'Runaway Button',
      'b.hint': 'It gets tired on the fifth try.',

      'ev.invisible': 'Invisible block. Did that hurt?',
      'ev.bridge': 'The bridge is collapsing. Run!',
      'ev.reverse': 'Controls inverted. Left is right now.',
      'ev.gravFlip': 'Gravity flipped.',
      'ev.gravBack': 'Gravity restored.',
      'ev.ceiling': 'Incoming from above!',
      'ev.slide': 'The spike is coming for you!',
      'ev.levelDone': 'Level {n} cleared. The next one is worse.',
      'ev.allDone': 'All 5 levels cleared. Now the bonus.',
      'ev.radarOn': 'Trap radar on. Shameful, but fine.',
      'ev.radarOff': 'Trap radar off.',

      'die.ceiling': 'A spike fell on your head.',
      'die.hidden': 'You sat right on a hidden spike.',
      'die.spike': 'You headbutted a spike. Congrats.',
      'die.fake': 'You fell for the golden door. Free cheese is in the mousetrap.',
      'die.void': 'Into the void. You don\'t have wings.',

      'troll': [
        'Don\'t break the keyboard. We just started.',
        'That spike was always there. You just didn\'t look.',
        'Your reflexes are still loading.',
        'So close... just kidding, you weren\'t even close.',
        'It\'s not a trap. It\'s just physics.',
        'Don\'t hit the mouse. It did nothing wrong.',
        'This time you\'ll make it for sure. (You won\'t.)',
        'If patience were a rock, yours would be gravel by now.',
        'The developer is watching this and laughing.',
        'Are you sure the jump key works?',
        'Go drink some water. We\'ll wait.',
        'Who put that invisible block there anyway?'
      ],

      'bonus.title': 'RUNAWAY BUTTON',
      'bonus.start': 'Click the button 5 times to claim your reward. If you can.',
      'bonus.btn': 'CLAIM REWARD',
      'bonus.fake': 'CLICK HERE',
      'bonus.count': '{c} / {t} caught · {d} dodges',
      'bonus.hit': 'Nice. {c}/{t}, keep going.',
      'bonus.fakeHit': 'That was a fake. Counter reset.',
      'bonus.taunts': [
        'Is your mouse getting old?',
        'You can\'t catch me.',
        'Over here.',
        'Don\'t click the fake ones.'
      ],

      'mobile.title': 'Zero Trust is desktop only.',
      'mobile.sub': 'You need a keyboard. Please open it on a PC.'
    }
  };

  function detectLang() {
    try {
      const saved = localStorage.getItem('zt.lang');
      if (saved === 'tr' || saved === 'en') return saved;
    } catch (e) {}
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('tr') ? 'tr' : 'en';
  }

  let lang = detectLang();
  const listeners = [];

  ZT.t = function (key, vars) {
    let s = STRINGS[lang][key];
    if (s === undefined) s = STRINGS.en[key];
    if (s === undefined) return key;
    if (typeof s === 'string' && vars) {
      s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    }
    return s;
  };

  ZT.getLang = () => lang;

  ZT.applyDom = function (root) {
    (root || document).querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = ZT.t(el.getAttribute('data-i18n'));
    });
    document.documentElement.lang = lang;
  };

  ZT.setLang = function (next) {
    if (next !== 'tr' && next !== 'en') return;
    lang = next;
    try { localStorage.setItem('zt.lang', lang); } catch (e) {}
    ZT.applyDom();
    listeners.forEach((fn) => fn(lang));
  };

  ZT.onLang = (fn) => listeners.push(fn);
})(window.ZT);
