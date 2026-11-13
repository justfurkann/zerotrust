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

      'l1.title': 'Merhaba',
      'l1.hint': 'Zemin her zaman zemin değildir. Ortadaki kısmı atla.',
      'l1.s1': 'Kapıya yürü. Bu kadar.',

      'l2.title': 'Güven',
      'l2.hint': 'İndiğin yer de tuzak. Çukurun dibinden atla, uzağa in. Tavana dikkat, acele etme.',
      'l2.s1': 'Dikenlerin üstünden atla. Kolay.',

      'l3.title': 'Köprü',
      'l3.hint': 'Köprüde durma, ortadaki tahtayı atla. Kapıya giden basamak görünmüyor.',
      'l3.s1': 'Köprü sağlam. Galiba.',
      'l3.s2': 'Kafanı vur.',

      'l4.title': 'Yay',
      'l4.hint': 'Havadayken sağ tuşu bırak, duvarın hemen dibine in.',
      'l4.s1': 'Duvar mı? Yay var.',

      'l5.title': 'Sessizlik',
      'l5.hint': 'Tam zıplama. Tuşa kısa bas, alçak zıpla.',
      'l5.s1': 'Bu sefer gerçekten tuzak yok.',

      'l6.title': 'Ayna',
      'l6.hint': 'İlk sütundan sonra sol sağ, sağ sol.',
      'l6.s1': 'Sadece birkaç zıplama.',

      'l7.title': 'Kaçış',
      'l7.hint': 'Durmak yok. Dikenleri koşarken atla.',
      'l7.s1': 'Koş.',

      'l8.title': 'Son',
      'l8.hint': 'Tanıdık yerler yalan söyler. Kapının peşinden gitmekten vazgeçme.',
      'l8.s1': 'Artık her şeyi biliyorsun.',

      'l9.title': 'Anahtar',
      'l9.hint': 'Anahtarı alınca arkana bakma, kapıya koş. Dikenleri koşarken atla.',
      'l9.s1': 'Kapı kilitli. Anahtar orada.',

      'l10.title': 'Ürkek',
      'l10.hint': 'Platformlar zıpladığın an kaçar. Havada yön düzelt; üçüncüsü sana doğru gelir, sağı bırak.',
      'l10.s1': 'Platformlar biraz utangaç.',

      'l11.title': 'Sabır',
      'l11.hint': 'Bu sefer bekleme, tavan sabırsız. Bloğun altından koşarak geç. Diken geri dönecek, iki kez atla.',
      'l11.s1': 'Acele etme. Düşün.',

      'l12.title': 'İksir',
      'l12.hint': 'Köprüdeki küpü atla. İkinci küpü al, ağırlığınla duvarı yık.',
      'l12.s1': 'Güç küpü! Al, güçlen.',

      'l13.title': 'Başlığa Güvenme',
      'l13.hint': 'Sol üstteki başlık düşer: dur, düşsün, üstüne çık. Radar açıksa ona da güvenme.',
      'l13.s1': 'Kapı solda. Yukarı bakma.',

      'l14.title': 'Gölge',
      'l14.hint': 'Gölgen bir saniye arkanda. Bir saniyeden uzun durma, geri dönme. Bloğa çok kısa bir an yavaşla.',
      'l14.s1': 'Yalnız değilsin.',

      'l15.title': 'Hata',
      'l15.hint': 'Pencere bir platform. Üstüne çık ama sağ üstteki ×\'e değme; ondan önce atla.',
      'l15.s1': 'Sunucularımız çok sağlam.',

      'l16.title': 'Takla',
      'l16.hint': 'Mavi alanda zıplarsan yerçekimi döner. Tavanda yürü, ikinci alanda tekrar zıpla.',
      'l16.s1': 'Aşağısı dikenli. Ya yukarısı?',

      'l17.title': 'Tavan Arası',
      'l17.hint': 'Tavanda da tuzak var. Dikenleri aşağı doğru zıplayarak geç, sahte tavanın üstünden atla.',
      'l17.s1': 'Yukarısı güvenli. Ters ama güvenli.',

      'l18.title': 'Sahte Kapı',
      'l18.hint': 'Sağdaki kapı seni yer. Başladığın yerin solundaki duvara yürü.',
      'l18.s1': 'Çıkış sağda. Her zamanki gibi.',

      'l19.title': 'İntikam',
      'l19.hint': 'Öldüğün yerler tuzağa dönüşür. Her denemede başka bir yol dene ya da üstlerinden atla.',
      'l19.s1': 'Hatalarından ders al.',

      'l20.title': 'Kaçak',
      'l20.hint': 'Platformlar kaçıyor, gölgen arkanda. Hiçbir platformda bir saniyeden uzun durma; ikincisi sana gelir.',
      'l20.s1': 'Acele et ama dikkatli ol.',

      'l21.title': 'Ağır Abi',
      'l21.hint': 'Küpler tam zıplamanın tepesinde. Tuşa kısa bas, alçak zıpla, küplerin altından geç.',
      'l21.s1': 'Güç küpleri bedava!',

      'l22.title': 'Telaş',
      'l22.hint': 'Anahtarı al ve hiç durmadan kapıya koş. Durursan tavan iner, yavaşlarsan anahtar yetişir.',
      'l22.s1': 'Kapı kilitli. Acele etme.',

      'l23.title': 'Tersyüz',
      'l23.hint': 'Anahtar tavanda. Mavi alanda yukarı dön, anahtarı al, aynı alanda aşağı dön, kapıya koş.',
      'l23.s1': 'Anahtar yukarıda.',

      'l24.title': 'Sıfır Güven',
      'l24.hint': 'Pencereden ×\'e değmeden atla. Sağdaki kapı sahte; alçak sütunun içine yürü. Gölgen arkanda.',
      'l24.s1': 'Son kez: hiçbir şeye güvenme.',

      'ev.invert': 'Bir şey değişti...',
      'ev.fakeWin': 'Bölüm tamamlandı!',
      'ev.joke': 'Şaka. Kapı başa döndü.',
      'ev.doorRun': 'Kapı: "Hayır."',
      'ev.doorRun2': 'Kapı fikrini değiştirdi.',
      'ev.levelDone': 'Bölüm {n} bitti. Sıradaki daha beter.',
      'ev.radarOn': 'Tuzak radarı açık. Ayıp ama olsun.',

      'die.spike': 'Dikene bastın.',
      'die.pop': 'Diken tam ayağının altında bitti.',
      'die.crush': 'Tepene blok düştü.',
      'die.slide': 'Diken seni buldu.',
      'die.void': 'Boşluğa düştün.',
      'die.ghost': 'Görünmez dikenlere kafa attın.',
      'die.key': 'Anahtar seni yakaladı.',
      'die.ceil': 'Tavan beklemekten sıkıldı.',
      'die.boomerang': 'Diken geri döndü.',
      'die.clone': 'Kendi gölgene çarptın.',
      'die.hud': 'Bölüm başlığı kafana düştü.',
      'die.decoy': 'Kapı seni yedi.',
      'die.revenge': 'Eski ölümün seni buldu.',

      'ev.flip': 'Yerçekimi: ters.',
      'ev.secret': 'Duvar da mı yalancıymış?',
      'ev.revenge': 'Öldüğün yerler artık birer tuzak.',
      'zone.flip': 'ZIPLA',
      'win.title': 'Zero Trust — Hata',
      'win.msg': 'Bağlantı kesildi.',
      'win.sub': 'Sunucuya ulaşılamıyor. (0xZ3R0)',
      'win.retry': 'Tekrar dene',
      'win.ok': 'Tamam',

      'ev.key': 'Anahtar senin. Kapı açıldı.',
      'ev.keyTurn': 'Anahtarın dişleri var!',
      'ev.locked': 'Kilitli. Anahtar lazım.',
      'ev.ceilWarn': 'Tavan sabırsızlanıyor...',
      'ev.cube': 'Güçlendin! Ve ağırlaştın.',
      'ev.clone': 'Arkanda biri var.',
      'ev.hudFall': 'Başlık da mı?!',
      'ev.radarLie': 'Radara bile mi güvendin? Oyunun adı ZERO TRUST!',

      'ctx.same': 'Aynı tuzağa {n}. kez düştün. Kararlılığına hayranım.',
      'ctx.fast': 'Dünya rekoru! Daha nefes almadan öldün.',
      'ctx.door': 'Kapı koluna elin değmişti hâlbuki...',

      'settings.music': 'Müzik',
      'levels.best': '{t} · {d} ölüm',
      'end.time': 'Süre {t} · {n} ölüm',

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

      'menu.demo': 'Demo · bu ölümler sayılmıyor',
      'menu.progress': 'İlerleme',
      'menu.time': 'Toplam süre',
      'stat.time': 'Süre',
      'stat.best': 'Rekor',
      'stat.deaths': 'Ölüm',
      'stat.levelDeaths': 'Bu bölümde',
      'stat.cleared': 'Geçilen bölüm',
      'stat.worst': 'En çok öldüğün',
      'hud.best': 'Rekor',
      'hud.total': 'toplam',
      'hud.restart': 'yeniden',
      'levels.hintKeys': 'Yön tuşları gezin · Q / E perde değiştir · Enter başlat',
      'levels.none': 'Henüz geçilmedi',
      'levels.next': 'Sıradaki',
      'ch1.name': 'Perde I',
      'ch1.title': 'Güven Sorunları',
      'ch1.desc': 'Zemin, tabela, kapı. Hepsi yalan söylüyor.',
      'ch2.name': 'Perde II',
      'ch2.title': 'Kötü Niyet',
      'ch2.desc': 'Artık eşyalar da sana karşı: anahtar, tavan, hatta bölüm başlığı.',
      'ch3.name': 'Perde III',
      'ch3.title': 'Hepsi Birden',
      'ch3.desc': 'Öğrendiğin her şey, aynı anda, sana karşı.',
      'ev.record': 'Yeni rekor: {t}',
      'ev.time': 'Süre {t} · rekor {b}',
      'settings.game': 'Oyun',
      'settings.av': 'Ses ve görüntü',
      'settings.data': 'Kayıt',
      'settings.resetDesc': 'Bütün bölümler, rekorlar ve ölümler silinir.',
      'ctl.fullscreen': 'Tam ekran',

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

      'l1.title': 'Hello',
      'l1.hint': 'The floor isn\'t always floor. Jump over the middle part.',
      'l1.s1': 'Walk to the door. That\'s it.',

      'l2.title': 'Trust',
      'l2.hint': 'The landing is a trap too. Jump from the very edge and land far. Watch the ceiling, don\'t rush.',
      'l2.s1': 'Jump over the spikes. Easy.',

      'l3.title': 'Bridge',
      'l3.hint': 'Don\'t stop on the bridge, skip the middle plank. The step to the door is invisible.',
      'l3.s1': 'The bridge is solid. Probably.',
      'l3.s2': 'Hit your head.',

      'l4.title': 'Spring',
      'l4.hint': 'Let go of right mid-air and land right next to the wall.',
      'l4.s1': 'A wall? There\'s a spring.',

      'l5.title': 'Silence',
      'l5.hint': 'Don\'t full jump. Tap the key for a low hop.',
      'l5.s1': 'No traps this time. For real.',

      'l6.title': 'Mirror',
      'l6.hint': 'After the first pillar, left is right and right is left.',
      'l6.s1': 'Just a few jumps.',

      'l7.title': 'Run',
      'l7.hint': 'Don\'t stop. Jump the spikes while running.',
      'l7.s1': 'Run.',

      'l8.title': 'The End',
      'l8.hint': 'Familiar places lie. Keep chasing the door.',
      'l8.s1': 'You know everything now.',

      'l9.title': 'The Key',
      'l9.hint': 'Once you grab the key, don\'t look back. Run for the door and jump the spikes on the way.',
      'l9.s1': 'The door is locked. The key is over there.',

      'l10.title': 'Shy',
      'l10.hint': 'Platforms flinch the moment you jump. Steer in mid-air; the third one comes toward you, so let go of right.',
      'l10.s1': 'The platforms are a little shy.',

      'l11.title': 'Patience',
      'l11.hint': 'Don\'t wait this time, the ceiling is impatient. Run under the block. The spike comes back, jump it twice.',
      'l11.s1': 'Take your time. Think.',

      'l12.title': 'Potion',
      'l12.hint': 'Jump over the cube on the bridge. Take the second one and smash the wall with your weight.',
      'l12.s1': 'Power cube! Grab it, get stronger.',

      'l13.title': 'Don\'t Trust the Title',
      'l13.hint': 'The title in the top left falls: stop, let it drop, climb on it. If the radar is on, don\'t trust it either.',
      'l13.s1': 'The door is on the left. Don\'t look up.',

      'l14.title': 'Shadow',
      'l14.hint': 'Your shadow is one second behind you. Never stop longer than a second, never turn back. Slow down only briefly for the block.',
      'l14.s1': 'You are not alone.',

      'l15.title': 'Error',
      'l15.hint': 'The window is a platform. Climb on it, but don\'t touch the × in the top right; jump before it.',
      'l15.s1': 'Our servers are rock solid.',

      'l16.title': 'Flip',
      'l16.hint': 'Jump inside the blue zone to flip gravity. Walk on the ceiling, then jump again in the second zone.',
      'l16.s1': 'Spikes below. What about above?',

      'l17.title': 'Upside Down',
      'l17.hint': 'The ceiling has traps too. Jump downward over the spikes and skip the fake ceiling.',
      'l17.s1': 'It\'s safe up there. Upside down, but safe.',

      'l18.title': 'Decoy',
      'l18.hint': 'The door on the right eats you. Walk into the wall to the left of where you start.',
      'l18.s1': 'The exit is on the right. As always.',

      'l19.title': 'Revenge',
      'l19.hint': 'Places where you died turn into traps. Take a different route each time, or jump over them.',
      'l19.s1': 'Learn from your mistakes.',

      'l20.title': 'Runaway',
      'l20.hint': 'Platforms flee, your shadow follows. Never stay on a platform longer than a second; the second one comes at you.',
      'l20.s1': 'Hurry, but be careful.',

      'l21.title': 'Heavyweight',
      'l21.hint': 'The cubes sit at the top of a full jump. Tap for a low hop and pass under them.',
      'l21.s1': 'Free power cubes!',

      'l22.title': 'Rush',
      'l22.hint': 'Grab the key and run for the door without stopping. Stop and the ceiling falls; slow down and the key catches you.',
      'l22.s1': 'The door is locked. No rush.',

      'l23.title': 'Inside Out',
      'l23.hint': 'The key is on the ceiling. Flip up in the blue zone, grab it, flip back down in the same zone, run for the door.',
      'l23.s1': 'The key is up there.',

      'l24.title': 'Zero Trust',
      'l24.hint': 'Jump off the window before the ×. The door on the right is fake; walk into the low pillar. Your shadow is behind you.',
      'l24.s1': 'One last time: trust nothing.',

      'ev.invert': 'Something changed...',
      'ev.fakeWin': 'Level complete!',
      'ev.joke': 'Just kidding. The door went back to the start.',
      'ev.doorRun': 'Door: "No."',
      'ev.doorRun2': 'The door changed its mind.',
      'ev.levelDone': 'Level {n} cleared. The next one is worse.',
      'ev.radarOn': 'Trap radar on. Shameful, but fine.',

      'die.spike': 'You stepped on a spike.',
      'die.pop': 'A spike grew right under your feet.',
      'die.crush': 'A block fell on your head.',
      'die.slide': 'The spike found you.',
      'die.void': 'You fell into the void.',
      'die.ghost': 'You headbutted invisible spikes.',
      'die.key': 'The key caught you.',
      'die.ceil': 'The ceiling got tired of waiting.',
      'die.boomerang': 'The spike came back.',
      'die.clone': 'You ran into your own shadow.',
      'die.hud': 'The level title fell on your head.',
      'die.decoy': 'The door ate you.',
      'die.revenge': 'Your old death found you.',

      'ev.flip': 'Gravity: flipped.',
      'ev.secret': 'Even the wall was lying?',
      'ev.revenge': 'Where you died is now a trap.',
      'zone.flip': 'JUMP',
      'win.title': 'Zero Trust — Error',
      'win.msg': 'Connection lost.',
      'win.sub': 'Server unreachable. (0xZ3R0)',
      'win.retry': 'Retry',
      'win.ok': 'OK',

      'ev.key': 'Got the key. The door is open.',
      'ev.keyTurn': 'The key has teeth!',
      'ev.locked': 'Locked. You need a key.',
      'ev.ceilWarn': 'The ceiling is getting impatient...',
      'ev.cube': 'Powered up! And heavier.',
      'ev.clone': 'Someone is behind you.',
      'ev.hudFall': 'Even the title?!',
      'ev.radarLie': 'You trusted the radar? The game is called ZERO TRUST!',

      'ctx.same': 'Same trap, attempt {n}. I admire your dedication.',
      'ctx.fast': 'World record! Dead before your first breath.',
      'ctx.door': 'Your hand was already on the doorknob...',

      'settings.music': 'Music',
      'levels.best': '{t} · {d} deaths',
      'end.time': 'Time {t} · {n} deaths',

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

      'menu.demo': 'Demo · these deaths are free',
      'menu.progress': 'Progress',
      'menu.time': 'Total time',
      'stat.time': 'Time',
      'stat.best': 'Best',
      'stat.deaths': 'Deaths',
      'stat.levelDeaths': 'This level',
      'stat.cleared': 'Levels cleared',
      'stat.worst': 'Deadliest level',
      'hud.best': 'Best',
      'hud.total': 'total',
      'hud.restart': 'restart',
      'levels.hintKeys': 'Arrows to browse · Q / E switch act · Enter to start',
      'levels.none': 'Not cleared yet',
      'levels.next': 'Up next',
      'ch1.name': 'Act I',
      'ch1.title': 'Trust Issues',
      'ch1.desc': 'Floors, signs, doors. They all lie.',
      'ch2.name': 'Act II',
      'ch2.title': 'Bad Faith',
      'ch2.desc': 'Now the objects are against you: the key, the ceiling, even the level title.',
      'ch3.name': 'Act III',
      'ch3.title': 'All At Once',
      'ch3.desc': 'Everything you learned, all at once, against you.',
      'ev.record': 'New record: {t}',
      'ev.time': 'Time {t} · best {b}',
      'settings.game': 'Game',
      'settings.av': 'Audio & display',
      'settings.data': 'Save data',
      'settings.resetDesc': 'Wipes every level, record and death.',
      'ctl.fullscreen': 'Fullscreen',

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
