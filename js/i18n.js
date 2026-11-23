/* Zero Trust — dil dosyası (TR / EN) */
window.ZT = window.ZT || {};

(function (ZT) {
  'use strict';

  const STRINGS = {
    tr: {
      'tagline': 'Hiçbir şeye güvenme.',

      // ── Hikâye ve anlatıcı ──
      'ch8.name': 'Final',
      'ch8.title': 'Taht Odası',
      'ch8.desc': 'Nokta burada. Sonunda.',
      'chapter.ch2': [
        'zero:calm|Sınırı geçtin. İtiraf edeyim, biraz şaşırdım.',
        'dot:calm|Kare?! Kare, sen misin? Buradayım!',
        'zero:smug|Duydun mu? Uzakta değil. Ya da öyle görünmek istiyor.',
        'zero:calm|Bu kasabada eşyalar da Üçgenlere çalışır. Anahtar, tavan, hatta bölüm başlığı.'
      ],
      'chapter.ch3': [
        'zero:calm|Yalan Dairesi. Üçgenler her şeyi burada kayda geçirir.',
        'zero:lie|Ben burada hiç çalışmadım. Kesinlikle.',
        'dot:calm|Kare, acele et! Burası... burası tuhaf. Pencereler konuşuyor!',
        'zero:smug|Pencereler konuşmaz. Ama üstlerine basılabilir.'
      ],
      'chapter.ch4': [
        'zero:calm|Fabrika. Dikenleri burada döküyorlar.',
        'zero:sad|Bir zamanlar ben de bir şeyler yapardım. Sonra güvenmeyi bıraktım.',
        'dot:calm|Sesimi duyuyor musun? Bu tarafa! Hep sağa!',
        'zero:smug|Hep sağa, diyor. Hmm. Not aldım.'
      ],
      'chapter.ch5': [
        'zero:calm|Taş Bahçesi. Buraya gelen herkes biraz kalır.',
        'zero:calm|Burada öldüğün yer taşa döner. Son üç ölümün. Ölümünü harcama, yatırım yap.',
        'dot:calm|Kare... çok yorulduysan bekleyebilirim. Gerçekten. Acelesi yok.',
        'zero:lie|Ne tatlı. Değil mi?'
      ],
      'chapter.ch6': [
        'zero:calm|Saat Kulesi. Burada zaman sayılmaz, zıplayışlar sayılır.',
        'dot:calm|Kule çok yüksek ama en tepedeyim! Sayarak çık!',
        'zero:smug|Senin yerine ben mi sayayım? Hayır. Ama sayıyorum. Hep sayıyorum.'
      ],
      'chapter.ch7': [
        'zero:calm|Gözetleme Kulesi. Nokta\'yı buradan görebilirsin.',
        'zero:sad|Ve o da seni görebilir. Her adımını. Hep gördü mü acaba?',
        'dot:calm|Kare! Son kat! Neredeyse geldin!',
        'zero:calm|Neye baktığına dikkat et. Burada bakmak, inanmak demek.'
      ],
      'chapter.ch8': [
        'zero:calm|Burası son oda.',
        'zero:wide|Kare. Kafesi açmadan önce sana bir şey söylemem lazım.',
        'zero:lie|...Yok. Boş ver. Git, kurtar onu.',
        'dot:calm|Kare! Buradayım! Lütfen çabuk ol!'
      ],
      'story.betray1': [
        'dot:calm|Kare! Geldin! Gerçekten geldin!',
        'dot:calm|Bütün o tuzaklar, dikenler, sahte kapılar... Hepsini geçtin. Benim için.'
      ],
      'story.betray2': [
        'dot:evil|Hepsini ben kurdum.',
        'dot:evil|Kaçırılma mı? Ben istedim. Sadece bir şeyi merak ettim.',
        'dot:evil|Bana ne kadar güvenirsin?',
        'dot:evil|Cevap: fazlasıyla. Hoşça kal, Kare.'
      ],
      'story.betray3': [
        'zero:wide|Kare! Dinle beni!',
        'zero:calm|Bu sefer bana güven. Sadece bu sefer.',
        'zero:calm|Mor tabelalar benim. Onlar doğruyu söyler. Koş!'
      ],
      'story.ending': [
        'zero:calm|Çıktın.',
        'zero:calm|Sana baştan söylemiştim: hiçbir şeye güvenme.',
        'zero:sad|Ama son anda bana güvendin. Ve işe yaradı.',
        'zero:smug|Bunu kimseye söyleme. İtibarım var.',
        'zero:lie|Bir de... Nokta\'yı bir daha görürsen, bana haber ver. Sadece merak.'
      ],
      'story.theEnd': 'SON',
      'story.thanks': 'Oynadığın için teşekkürler. Devam etmek için Space.',
      'run2.title': 'Koş',
      'run2.hint': 'Burada öğrendiğin her şey, arka arkaya ve durmadan. Çukurda alçak zıpla. Sahte zeminin üstünden atla, indiğin an bir daha zıpla. Yayla duvarın tepesine çık ve oradan atla. Kapının basamağı görünmez: altında zıplayıp kafanla bul.',
      'run2.s1': 'Koş. Düşünme.',
      'paper.title': 'Evrak',
      'paper.hint': 'Pencereden tavana, tavandan yere, oradan duvara. Pencerenin ×\'ine gelmeden atla. Mavi alanda zıpla, tavanda dikenin ve sahte deliğin üstünden atla, ikinci alanda yere dön. Sağdaki kapı seni yer: gerçek çıkış çatlak duvarın içinde.',
      'paper.s1': 'Çıkış sağda. Mühürlü, imzalı.',
      'stamp.title': 'Mühür',
      'stamp.hint': 'Pencereler sen yaklaştıkça açılır; hiçbir ×\'e değme. Her pencerenin sonuna gelmeden zıpla. Son pencereden atlarken havada sağı bırak: yakındaki kapı seni yer, karşı kıyıda bir kez daha zıpla.',
      'stamp.s1': 'Açtığın pencereleri kapatmayı unutma.',
      'f1.title': 'Taht Odası',
      'f1.hint': 'Kafes odanın sonunda. Sahte zemini atla, düşen bloğa dikkat et, geri dönen dikeni iki kez atla.',
      'f1.s1': 'Nokta burada. Gerçekten.',
      'f2.title': 'Kaçış',
      'f2.hint': 'Mor tabelalar Sıfır\'ın ve bu sefer doğruyu söylüyor. Üstten git, sahte dikenlerin içinden yürü, yakındaki kapının üstünden atla.',
      'f2.s1': 'Üstten git. Alttaki zemin sahte.',
      'f2.s2': 'Bu dikenler sahte. Zıplama, sadece yürü.',
      'f2.s3': 'Yakındaki kapı tuzak. Üstünden atla.',
      'name.zero': 'SIFIR',
      'name.dot': 'NOKTA',
      'menu.story': 'Hikâyeyi izle',
      'story.skip': 'Geç',
      'story.shout': 'KARE!',
      'story.intro': [
        'Arkadaşını aldılar, değil mi?',
        'Üçgenler. Onları tanırım. Yollarına koydukları her şey bir tuzaktır.',
        'Nokta\'yı geri istiyorsan, sana yolu gösterebilirim.',
        'Tek bir kuralım var.',
        'Hiçbir şeye güvenme.',
        '...Bana bile.'
      ],
      'zero.greetFirst': [
        'Ah. Yeni biri.',
        'Merhaba. Ben Sıfır.',
        'Oyna\'ya bas. Sana bir hikâye anlatacağım.',
        'Belki doğrudur. Belki değil.',
        'Bana dokunmayı bırak. Gıdıklanıyorum.'
      ],
      'zero.greetBack': [
        'Geri geldin.',
        'Nokta hâlâ bekliyor. Sanırım.',
        '{d} bölüm bitti, {total} tane var. Acele etmiyorsun.',
        '{n} kez öldün. Saydım. Tabii ki saydım.',
        'Biliyor musun, sana hiç yalan söylemedim. Bu da bir yalan.'
      ],
      'zero.greetMany': '{n} ölüm. Ben olsam çoktan vazgeçerdim. İyi ki ben değilsin.',
      'menu.play': 'Oyna',
      'menu.continue': 'Devam Et',
      'menu.levels': 'Harita',
      'menu.settings': 'Ayarlar',
      'menu.deaths': 'Toplam ölüm',
      'controls.short': 'A D / ← → hareket · W / Space zıpla · R yeniden · Esc duraklat',

      'back': 'Geri',
      'map.stars': 'Yıldız',
      'map.starRule': '★ geç · ★★ en fazla 3 ölümle · ★★★ hiç ölmeden.',
      'import.done': 'Eski adresteki kaydın geldi: {n} bölüm. Seni unutmadım. Unutamam.',
      'import.empty': 'Eski adresten geldin ama yanında kayıt yoktu. Baştan, o zaman.',
      'map.top': 'Nokta yukarıda bir yerde',
      'map.best': 'En iyi süre',
      'map.deaths': 'Ölüm',
      'map.state': 'Durum',
      'map.play': 'Tıkla ya da Enter: oyna',
      'map.lockedDesc': 'Önceki bölümü geç, yol açılsın. Ya da açılmasın. Bakarız.',
      'map.zeroDone': 'Hepsini bitirdin. Haritaya yine de güvenme.',
      'map.zero': [
        'Buradasın. Nokta yukarıda bir yerde.',
        'Yol yukarı gidiyor. Ben de. Tesadüf.',
        'Her daire bir bölüm. Her bölüm bir yalan.',
        'Tırmanmaya devam. Aşağı bakma. Ya da bak, fark etmez.',
        'Bu haritayı ben çizdim. Şimdilik doğru.',
        'Kaç kere öldüğünü sayıyorum. Merak etme.'
      ],
      'levels.title': 'Yolculuk',
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
      'hint.used1': 'Peki. Bir ipucu. Sadece başlangıcı.',
      'hint.used2': 'Tamamı bu. Bunu da ben söylemedim.',
      'hint.left': 'Kalan ipucu: {n}',
      'hint.none': 'İpucun kalmadı.',
      'hint.howTo': 'Bir bölümü hiç ölmeden geç ya da bir yeri bitir: +1.',
      'hint.allOpen': 'Bildiğim her şeyi söyledim. Gerisi sende.',
      'hint.gain': '+{n} ipucu',
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

      'ev.invert': 'Bir şey değişti. Ben değil. Ya da ben.',
      'ev.fakeWin': 'Bölüm tamamlandı!',
      'ev.joke': 'Şaka. Kapı başa döndü.',
      'ev.doorRun': 'Kapı: "Hayır."',
      'ev.doorRun2': 'Kapı fikrini değiştirdi.',
      'ev.levelDone': 'Bölüm {n} geçildi. Nokta biraz daha yakın. Sanırım.',
      'ev.radarOn': 'Tuzak radarı açık. Ayıp ama olsun.',

      'die.spike': 'Bir Üçgen askerine bastın.',
      'die.pop': 'Diken tam ayağının altında bitti. Üçgenler sabırlıdır.',
      'die.crush': 'Tepene blok düştü. Yukarı bakmayı öğren.',
      'die.slide': 'Diken seni buldu. Hep bulur.',
      'die.void': 'Boşluğa düştün. Orada kimse yok. Ben bile.',
      'die.ghost': 'Görünmez dikenler. Görünmez ama gerçek.',
      'die.key': 'Anahtar seni ısırdı. Uyarmıştım. Sayılır.',
      'die.ceil': 'Tavan beklemekten sıkıldı. Ben de biraz.',
      'die.boomerang': 'Diken geri döndü. Hiçbir şey gerçekten gitmez.',
      'die.clone': 'Kendi gölgene çarptın. En tehlikeli düşmanın.',
      'die.hud': 'Bölüm başlığı kafana düştü. Okumayı seviyordun, değil mi?',
      'die.decoy': 'Kapı seni yedi. Her kapı çıkış değildir.',
      'die.revenge': 'Eski ölümün seni buldu.',

      'ev.flip': 'Yerçekimi: ters.',
      'ev.secret': 'Duvar da mı yalancıymış?',
      'ev.revenge': 'Öldüğün yerler artık birer tuzak.',
      'ev.stone': 'Öldüğün yer taşa döndü. Kullan onu.',
      'ev.shrink': 'Küçüldün. Hafifledin.',
      'zone.flip': 'ZIPLA',
      'win.title': 'Zero Trust — Hata',
      'win.msg': 'Bağlantı kesildi.',
      'win.sub': 'Sunucuya ulaşılamıyor. (0xZ3R0)',
      'win.retry': 'Tekrar dene',
      'win.ok': 'Tamam',

      'ev.key': 'Anahtar senin. Kapı açıldı.',
      'ev.keyTurn': 'Anahtarın dişleri var. Sürpriz.',
      'ev.locked': 'Kilitli. Anahtar lazım.',
      'ev.ceilWarn': 'Tavan sabırsızlanıyor...',
      'ev.cube': 'Güçlendin! Ve ağırlaştın.',
      'ev.clone': 'Arkanda biri var. Ben değilim.',
      'ev.hudFall': 'Başlık da mı?!',
      'ev.radarLie': 'Radara bile mi güvendin? Hiçbir şeye, dedim.',

      'ctx.same': 'Aynı tuzak, {n}. deneme. Kararlılığına hayranım. Gerçekten.',
      'ctx.fast': 'Daha nefes almadan öldün. Rekor bu.',
      'ctx.door': 'Kapı koluna elin değmişti hâlbuki. Neredeyse.',

      'settings.music': 'Müzik',
      'levels.best': '{t} · {d} ölüm',
      'end.time': 'Süre {t} · {n} ölüm',

      'troll': [
         'Klavyeye vurma. Ben yine de sayarım.',
         'O diken hep oradaydı. Söylemedim, çünkü sormadın.',
         'Reflekslerin hâlâ yükleniyor. Bekliyorum. Sabırla. Sayarak.',
         'Az kalsın geçiyordun. Şaka. Yaklaşamadın bile.',
         'Üçgenler gülüyor. Duyabiliyorum. Sen de duyuyor musun?',
         'Bir dahakine kesin geçersin. Bunu bir yalan olarak not et.',
         'Nokta seni bekliyor. Bence. Belki.',
         'Hiçbir şeye güvenme dedim. Zemine güvendin.',
         'Ölmek de bir öğrenme şeklidir. Çok verimli bir öğrencisin.',
         'Bir saniye gözümü kapattım. Yine mi?',
         'Sakin ol. Ben buradayım. Bunun iyi bir şey olduğundan emin değilim.',
         'Bu tuzağı tanıyorum. Artık sen de tanıyorsun.'
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
      'levels.hintKeys': '↑ ↓ yolda ilerle · Q / E yer değiştir · Enter başlat',
      'levels.none': 'Henüz geçilmedi',
      'levels.next': 'Sıradaki',
      'ch1.name': 'Perde I',
      'ch1.title': 'Sınır Kapısı',
      'ch1.desc': 'Üçgenlerin topraklarına ilk adım. Zemin, tabela, kapı: hepsi onların ve hepsi yalan söylüyor.',
      'ch2.name': 'Perde II',
      'ch2.title': 'Eşyalar Kasabası',
      'ch2.desc': 'Burada anahtarlar ısırır, tavanlar sabırsızdır. Eşyalar da Üçgenlerden yana.',
      'ch3.name': 'Perde III',
      'ch3.title': 'Yalan Dairesi',
      'ch3.desc': 'Hata pencereleri, sahte kapılar, ters dönen yerçekimi. Üçgenlerin bürokrasisi.',
      'ev.record': 'Yeni rekor: {t}',
      'ev.time': 'Süre {t} · rekor {b}',
      'settings.game': 'Oyun',
      'settings.av': 'Ses ve görüntü',
      'settings.data': 'Kayıt',
      'settings.resetDesc': 'Bütün bölümler, rekorlar ve ölümler silinir.',
      'ctl.fullscreen': 'Tam ekran',

      'ch4.name': 'Perde IV',
      'ch4.title': 'Fabrika',
      'ch4.desc': 'Uzun koridorlar, düğmeler, lazerler. Dikenler burada dökülüyor.',
      'ch5.name': 'Perde V',
      'ch5.title': 'Taş Bahçesi',
      'ch5.desc': 'Burada ölenler taşa döner. Sen de. Son üç ölümün köprü olur.',

      'l25.title': 'Uzun Yol',
      'l25.hint': 'Düğmeye bas ve hemen zıpla. Platformdan çöken basamağa, oradan karşıya. İlk bayrak sahte: üstünden atla. Süreli düğmeden sonra hiç durma.',
      'l25.s1': 'Sakın o düğmeye basma.',
      'l25.s2': 'Kayıt noktası. Yüzde yüz güvenli.',
      'l26.title': 'Gidiş Dönüş',
      'l26.hint': 'Giderken platformu kullan, üstteki köprüyü dönüşe sakla. Anahtarı alınca basamaktan köprüye çık ve koş. Lazerleri kapalıyken geç.',
      'l26.s1': 'Kapı burada. Anahtar... biraz ileride.',
      'l26.s2': 'Köprü tek kullanımlık. İyi düşün.',
      'l27.title': 'Çift Mesai',
      'l27.hint': 'İlk düğmenin üstünden geç, ikincide bekle: gölgen ilkine basınca kapı açılır. Son kapıda düğmede bir saniye dur, sonra kapıya koş; gölgen düğmeyi senin yerine tutar.',
      'l27.s1': 'Bu kapı iki kişilik. Sen tek misin?',
      'l27.s2': 'Biri düğmeyi tutmalı. Biri de geçmeli.',
      'l28.title': 'Ters Vardiya',
      'l28.hint': 'Düğmeye bas, mavi alanda zıpla, tavandan kapıyı süre bitmeden geç. Tavandaki düğme zemindeki kapıyı açar. İkinci yarıda lazer kapalıyken çevir.',
      'l28.s1': 'Saat işliyor. Kapı tavanda.',
      'l29.title': 'Makine Dairesi',
      'l29.hint': 'Üçüncü platform fazla taşımaz, titreyince atla. Köprüye lazerlerin ritmine bakıp gir; girdikten sonra duramazsın. Kapı duvarın üstüne kaçar: sağdaki yayı kullan.',
      'l29.s1': 'Aşağı bakma.',
      'l29.s2': 'Köprüye bir kere girdin mi durmak yok. Önce ritmi izle.',
      'l30.title': 'Son Mesai',
      'l30.hint': 'Düğmenin üstünden atla (dönüşte de). Köprüyü dönüşe sakla. İlk bayrak sahte. Anahtarı almadan önce sağdaki düğmeye bas ki dönüş kapısı açılsın.',
      'l30.s1': 'Bu sefer gerçekten basma.',
      'l30.s2': 'Geldiğin yolu hatırlıyor musun? Güzel. Koş.',

      'l31.title': 'Basamak',
      'l31.hint': 'Şerit atlanamaz. Dikene bilerek düş: öldüğün yer taşa döner, bir sonraki denemede üstüne bas. Son 3 ölümün sayılır; R taşları siler.',
      'l31.s1': 'Ölmek de bir seçenek.',

      'l32.title': 'Feda',
      'l32.hint': 'Kapı düğme basılıyken açık. Düğmenin üstünde dur, lazer seni orada taşa çevirsin. Sonra iki taşla köprü kur. Fazladan ölürsen en eski taş, yani düğmedeki gider.',
      'l32.s1': 'Bazı kapılar bedel ister.',

      'l33.title': 'İki Gölge',
      'l33.hint': 'Birinci ve ikinci düğmede yaklaşık bir saniye bekle, üçüncüye bas. O anda gölgelerin diğer iki düğmede olur. Bir saniyeden uzun durursan gölgen sana çarpar.',
      'l33.s1': 'Üç düğme, bir kişi. Ya da?',

      'l34.title': 'Ağırlık Merkezi',
      'l34.hint': 'İlk küpü atla, tünele küçükken gir. Tünelden sonra yüksekteki küpü al, duvarı yık. Tahta köprüden önce zıplayıp mor küpe dokun.',
      'l34.s1': 'Her şey doğru sırayla.',

      'l35.title': 'Köprü Kur',
      'l35.hint': 'Giderken dikenlere düşüp taşlardan köprü kur. Taşları birbirine yakın bırak: dönüşte anahtar peşindeyken o taşlardan atlayacaksın.',
      'l35.s1': 'Kapı burada. Anahtar orada. Arada dikenler.',

      'l36.title': 'Sıfır Saat',
      'l36.hint': 'Gölgenle iki düğmeye bas, taşlarla köprü kur, sonra son düğmenin üstünde dur ve gölgenin seni taşa çevirmesini bekle.',
      'l36.s1': 'Son kez: her şeyi kullan.',
      'l36.s2': 'Burada dur. Bekle. Güven bana.',

      'ev.cp': 'Kayıt noktası.',
      'ev.gate': 'Kapı açıldı.',
      'btn.hold': 'TUT',
      'die.cp': 'Kayıt noktası patladı. Ona da güvenme demiştim.',
      'die.gate': 'Kapı üstüne kapandı. Zamanlama, Kare.',
      'die.laser': 'Lazer açıkken geçilmez. Ritmi dinle.',

      'ch6.name': 'Perde VI',
      'ch6.title': 'Saat Kulesi',
      'ch6.desc': 'Her zıplayışta pembe ve mavi bloklar yer değiştirir. Kule saymayı bilir; sen de bil.',

      'l37.title': 'Tek Çift',
      'l37.hint': 'İlk zıplayışta mavi bloklar katılaşır: şu an orada olmayan bloğa atla. Dikenden sonra duvar katılaşır; yerinde bir kez daha zıpla.',
      'l37.s1': 'Her zıplayış dünyayı değiştirir.',
      'l38.title': 'Sayaç',
      'l38.hint': 'İlk duvardan önce bir kez zıpla. Son iki dikenin arasında fazladan bir kez zıpla; böylece son dikenden mavi bloğun üstüne inersin ve duvar açık kalır.',
      'l38.s1': 'Pembe duvar: tek sayıda zıplayışla geçilir.',
      'l38.s2': 'Hayalet bloğun içinde zıplama. Katılaşır.',
      'l39.title': 'Sabit Nokta',
      'l39.hint': 'Maviye, sonra pembeye atla. Pembeden ileri atlayıp dikende öl: taşın basamak olur. Sonraki denemede taşa, oradan karşıya.',
      'l39.s1': 'Bloklar gelip gider. Taş kalır.',
      'l40.title': 'Arkandan Sayan Var',
      'l40.hint': 'Dikenden sonra bir kez daha zıpla ki mavi blok hayalet kalsın. İkinci düğmede, bloğun içinde bekle; gölgen ilk düğmeye basınca kapı açılır. Çukurda mavi, pembe, karşı kıyı.',
      'l40.s1': 'Gölgen zıplasa da sayılmaz. Sayan sensin.',
      'l41.title': 'Raydan Çıkma',
      'l41.hint': 'Platformun arkasında dur, lazerin üstünden kısa bir zıplayışla geç. Mavi bloktan önce yerinde bir kez daha zıpla. İkinci lazerden sonra pembe blok hayalettir, dokunma.',
      'l41.s1': 'Platform bekler. Bloklar beklemez.',
      'l42.title': 'Fazla Mesai',
      'l42.hint': 'Giderken: bir zıpla, diken, çukurda mavi sonra pembe. Çıkıntıya zıplayıp anahtarı al, yürüyerek in. Dönüşte duvardan önce bir kez zıpla; gerisi geldiğin gibi.',
      'l42.s1': 'Kapı burada. Sayarak git, sayarak dön.',
      'l42.s2': 'Çıkarken zıplarsın. İnerken zıplamazsın.',

      'die.phase': 'Bloğun içinde kaldın. Saymayı unuttun; ben unutmadım.',

      "ch7.name": "Perde VII",
      "ch7.title": 'Gözetleme Kulesi',
      "ch7.desc": 'Okun gösterdiği yöne bakınca blok katılaşır. Nokta yakında. Ama kule de sana bakıyor.',
      "l43.title": "Bakış Açısı",
      "l43.hint": "Yeşil oklar sağa, turuncu oklar sola bakarken katı. Yeşil köprünün ucundan turuncuya zıpla; inişten önce kısa bir sol dokunuş yapıp tuşları bırak. Sonra sağa zıplayarak kıyıya geç.",
      "l43.s1": "Ok nereye, yüzün oraya: blok katı.",
      "l43.s2": "İleri gitmek için arkana bak.",
      "l44.title": "Kör Nokta",
      "l44.hint": "Platforma ortasından bin. Bir an sola bas, sonra yön tuşlarını bırak. Yüzün sola bakarken platform seni sağa, yeşil duvarın içinden taşır. Duvar tamamen arkanda kalmadan sağa dönme. Kıyıya yaklaşınca sağa zıpla.",
      "l44.s1": "Yoluna bakma. Gerisini platform halleder.",
      "l45.title": "Dönüş Yolu",
      "l45.hint": "Alttaki yeşil köprüden sağa yürü. Sağdaki anahtarı al; sola dönünce o köprü kaybolur. Basamağa çık, üstteki turuncu köprüye sola zıpla ve çıkışa dön.",
      "l45.s1": "Giderken yol var. Dönerken?",
      "l45.s2": "Yukarıdaki yol, geri dönene.",
      "l46.title": "Göz Göze",
      "l46.hint": "İlk düğmeyi geçip yeşil bloğun üstüne zıpla. Sola bakıp bloğun içindeki ikinci düğmeye düş; gölgen ilkine basınca kapı açılır. Yerinde tam zıpla; bloğun üstüne yükseldikten sonra sağa dön. Son köprüde sağa bak.",
      "l46.s1": "Gölgenin yüzü değil, senin yüzün önemli.",
      "l47.title": "Ters Bakış",
      "l47.hint": "Sağdaki mavi alanda zıpla: tavana düşersin. Sola bakarak turuncu tavanda yürü; tavandaki dikeni aşağı doğru zıplayarak geç. Soldaki mavi alanda yeniden zıpla, zemine in.",
      "l47.s1": "Ters dünyada bile sol, soldur.",
      "l48.title": "Son Bakış",
      "l48.hint": "Platformda sola bakıp duvardan geç. Kayıt noktasından sonra yeşilden turuncuya zıpla; inmeden sola dön. Son kayıt noktasından sağa yürürken turuncu duvar hayalet olur: gerçek kapı onun içinde. Sağdaki kapı sahte.",
      "l48.s1": "Gözünü kapatamazsın. Yüzünü çevirebilirsin.",
      "l48.s2": "Çıkışa bak. Arkana değil.",
      "die.gaze": 'Baktığın blok katılaştı. İçindeydin. Neye baktığına dikkat et.',

      'mobile.title': 'Zero Trust sadece bilgisayarda oynanır.',
      'mobile.sub': 'Klavye lazım. Lütfen PC\'den gir.'
    },

    en: {
      'tagline': 'Trust nothing.',

      // ── Story and narrator ──
      'ch8.name': 'Finale',
      'ch8.title': 'The Throne Room',
      'ch8.desc': 'Dot is here. Finally.',
      'chapter.ch2': [
        'zero:calm|You crossed the border. I\'ll admit, I\'m a little surprised.',
        'dot:calm|Square?! Square, is that you? I\'m here!',
        'zero:smug|Hear that? Not far. Or at least, that\'s how she wants it to sound.',
        'zero:calm|In this town, objects work for the Triangles too. Keys, ceilings, even the level title.'
      ],
      'chapter.ch3': [
        'zero:calm|The Bureau of Lies. The Triangles file everything here.',
        'zero:lie|I never worked here. Definitely not.',
        'dot:calm|Square, hurry! This place is... weird. The windows talk!',
        'zero:smug|Windows don\'t talk. But you can stand on them.'
      ],
      'chapter.ch4': [
        'zero:calm|The Factory. This is where they cast the spikes.',
        'zero:sad|I used to make things too, once. Then I stopped trusting.',
        'dot:calm|Can you hear me? This way! Keep going right!',
        'zero:smug|Keep going right, she says. Hmm. Noted.'
      ],
      'chapter.ch5': [
        'zero:calm|The Stone Garden. Everyone who comes here stays a while.',
        'zero:calm|Here, where you die turns to stone. Your last three deaths. Don\'t waste a death; invest it.',
        'dot:calm|Square... if you\'re tired, I can wait. Really. No rush.',
        'zero:lie|How sweet. Isn\'t it?'
      ],
      'chapter.ch6': [
        'zero:calm|The Clock Tower. Time doesn\'t count here. Jumps do.',
        'dot:calm|The tower is so tall, but I\'m at the top! Count your way up!',
        'zero:smug|Should I count for you? No. But I am counting. I always am.'
      ],
      'chapter.ch7': [
        'zero:calm|The Watchtower. You can see Dot from here.',
        'zero:sad|And she can see you. Every step. I wonder if she always could.',
        'dot:calm|Square! Top floor! You\'re almost here!',
        'zero:calm|Careful what you look at. Here, looking means believing.'
      ],
      'chapter.ch8': [
        'zero:calm|This is the last room.',
        'zero:wide|Square. Before you open the cage, I need to tell you something.',
        'zero:lie|...No. Never mind. Go, save her.',
        'dot:calm|Square! I\'m here! Please hurry!'
      ],
      'story.betray1': [
        'dot:calm|Square! You came! You really came!',
        'dot:calm|All those traps, the spikes, the fake doors... you got through all of them. For me.'
      ],
      'story.betray2': [
        'dot:evil|I built every one of them.',
        'dot:evil|The kidnapping? My idea. I just wanted to know one thing.',
        'dot:evil|How much would you trust me?',
        'dot:evil|Answer: way too much. Goodbye, Square.'
      ],
      'story.betray3': [
        'zero:wide|Square! Listen to me!',
        'zero:calm|This time, trust me. Just this once.',
        'zero:calm|The purple signs are mine. They tell the truth. Run!'
      ],
      'story.ending': [
        'zero:calm|You made it out.',
        'zero:calm|I told you from the start: trust nothing.',
        'zero:sad|But at the very end, you trusted me. And it worked.',
        'zero:smug|Don\'t tell anyone. I have a reputation.',
        'zero:lie|Also... if you ever see Dot again, let me know. Just curious.'
      ],
      'story.theEnd': 'THE END',
      'story.thanks': 'Thanks for playing. Press Space to continue.',
      'run2.title': 'Run',
      'run2.hint': 'Everything you learned here, back to back, without stopping. Low hop over the pit. Jump the fake floor and jump again the moment you land. Spring onto the top of the wall and jump from there. The step to the door is invisible: jump under it and find it with your head.',
      'run2.s1': 'Run. Don\'t think.',
      'paper.title': 'Paperwork',
      'paper.hint': 'Window to ceiling, ceiling to floor, then into the wall. Jump off the window before the ×. Jump in the blue zone, hop over the spike and the fake hole on the ceiling, come back down in the second zone. The door on the right eats you: the real exit is inside the cracked wall.',
      'paper.s1': 'Exit on the right. Stamped and signed.',
      'stamp.title': 'Stamp',
      'stamp.hint': 'Windows open as you approach; never touch an ×. Jump before you reach the end of each window. Let go of right mid-air when you leave the last one: the near door eats you, so jump once more on the far bank.',
      'stamp.s1': 'Don\'t forget to close the windows you open.',
      'f1.title': 'The Throne Room',
      'f1.hint': 'The cage is at the end of the room. Skip the fake floor, watch the falling block, jump the returning spike twice.',
      'f1.s1': 'Dot is here. Really.',
      'f2.title': 'Escape',
      'f2.hint': 'The purple signs are Zero\'s, and this time they tell the truth. Take the top, walk through the fake spikes, jump over the near door.',
      'f2.s1': 'Take the top. The floor below is fake.',
      'f2.s2': 'These spikes are fake. Don\'t jump, just walk.',
      'f2.s3': 'The near door is a trap. Jump over it.',
      'name.zero': 'ZERO',
      'name.dot': 'DOT',
      'menu.story': 'Watch the story',
      'story.skip': 'Skip',
      'story.shout': 'SQUARE!',
      'story.intro': [
        'They took your friend, didn\'t they?',
        'The Triangles. I know them. Everything they put in your way is a trap.',
        'If you want Dot back, I can show you the way.',
        'I have just one rule.',
        'Trust nothing.',
        '...Not even me.'
      ],
      'zero.greetFirst': [
        'Oh. Someone new.',
        'Hello. I\'m Zero.',
        'Press Play. I\'ll tell you a story.',
        'Maybe it\'s true. Maybe not.',
        'Stop poking me. It tickles.'
      ],
      'zero.greetBack': [
        'You came back.',
        'Dot is still waiting. I think.',
        '{d} levels done, {total} in total. No rush, apparently.',
        'You died {n} times. I counted. Of course I counted.',
        'You know, I have never lied to you. That was a lie.'
      ],
      'zero.greetMany': '{n} deaths. I would have given up long ago. Good thing you\'re not me.',
      'menu.play': 'Play',
      'menu.continue': 'Continue',
      'menu.levels': 'Map',
      'menu.settings': 'Settings',
      'menu.deaths': 'Total deaths',
      'controls.short': 'A D / ← → move · W / Space jump · R restart · Esc pause',

      'back': 'Back',
      'map.stars': 'Stars',
      'map.starRule': '★ clear · ★★ with 3 deaths or fewer · ★★★ without dying.',
      'import.done': 'Your save from the old address arrived: {n} levels. I didn\'t forget you. I can\'t.',
      'import.empty': 'You came from the old address, but without a save. From the start, then.',
      'map.top': 'Dot is somewhere up there',
      'map.best': 'Best time',
      'map.deaths': 'Deaths',
      'map.state': 'Status',
      'map.play': 'Click or Enter: play',
      'map.lockedDesc': 'Clear the previous level and the path opens. Or it doesn\'t. We\'ll see.',
      'map.zeroDone': 'You finished it all. Still, don\'t trust the map.',
      'map.zero': [
        'You are here. Dot is somewhere up there.',
        'The path goes up. So do I. Coincidence.',
        'Every circle is a level. Every level is a lie.',
        'Keep climbing. Don\'t look down. Or do, it doesn\'t matter.',
        'I drew this map. It is accurate. For now.',
        'I\'m counting your deaths. Don\'t worry about it.'
      ],
      'levels.title': 'The Journey',
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
      'hint.used1': 'Fine. One hint. Just the start.',
      'hint.used2': 'That is all of it. You didn\'t hear it from me.',
      'hint.left': 'Hints left: {n}',
      'hint.none': 'You are out of hints.',
      'hint.howTo': 'Clear a level without dying, or finish a place: +1.',
      'hint.allOpen': 'I told you everything I know. The rest is on you.',
      'hint.gain': '+{n} hint',
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

      'ev.invert': 'Something changed. Not me. Or me.',
      'ev.fakeWin': 'Level complete!',
      'ev.joke': 'Just kidding. The door went back to the start.',
      'ev.doorRun': 'Door: "No."',
      'ev.doorRun2': 'The door changed its mind.',
      'ev.levelDone': 'Level {n} cleared. Dot is a little closer. I think.',
      'ev.radarOn': 'Trap radar on. Shameful, but fine.',

      'die.spike': 'You stepped on a Triangle soldier.',
      'die.pop': 'A spike grew right under your feet. Triangles are patient.',
      'die.crush': 'A block fell on your head. Learn to look up.',
      'die.slide': 'The spike found you. It always does.',
      'die.void': 'You fell into the void. Nobody is there. Not even me.',
      'die.ghost': 'Invisible spikes. Invisible, but real.',
      'die.key': 'The key bit you. I warned you. Sort of.',
      'die.ceil': 'The ceiling got tired of waiting. So did I, a little.',
      'die.boomerang': 'The spike came back. Nothing ever really leaves.',
      'die.clone': 'You ran into your own shadow. Your most dangerous enemy.',
      'die.hud': 'The level title fell on your head. You liked reading, didn\'t you?',
      'die.decoy': 'The door ate you. Not every door is an exit.',
      'die.revenge': 'Your old death found you.',

      'ev.flip': 'Gravity: flipped.',
      'ev.secret': 'Even the wall was lying?',
      'ev.revenge': 'Where you died is now a trap.',
      'ev.stone': 'Where you died turned to stone. Use it.',
      'ev.shrink': 'You shrank. Lighter now.',
      'zone.flip': 'JUMP',
      'win.title': 'Zero Trust — Error',
      'win.msg': 'Connection lost.',
      'win.sub': 'Server unreachable. (0xZ3R0)',
      'win.retry': 'Retry',
      'win.ok': 'OK',

      'ev.key': 'Got the key. The door is open.',
      'ev.keyTurn': 'The key has teeth. Surprise.',
      'ev.locked': 'Locked. You need a key.',
      'ev.ceilWarn': 'The ceiling is getting impatient...',
      'ev.cube': 'Powered up! And heavier.',
      'ev.clone': 'Someone is behind you. Not me.',
      'ev.hudFall': 'Even the title?!',
      'ev.radarLie': 'You trusted the radar? I said nothing.',

      'ctx.same': 'Same trap, attempt {n}. I admire your dedication. Truly.',
      'ctx.fast': 'Dead before your first breath. That\'s a record.',
      'ctx.door': 'Your hand was already on the doorknob. Almost.',

      'settings.music': 'Music',
      'levels.best': '{t} · {d} deaths',
      'end.time': 'Time {t} · {n} deaths',

      'troll': [
         'Don\'t hit the keyboard. I\'ll count anyway.',
         'That spike was always there. I didn\'t mention it because you didn\'t ask.',
         'Your reflexes are still loading. I\'m waiting. Patiently. Counting.',
         'So close. Just kidding. Not even close.',
         'The Triangles are laughing. I can hear them. Can you?',
         'Next time you\'ll make it for sure. File that under lies.',
         'Dot is waiting for you. I think. Maybe.',
         'I said trust nothing. You trusted the floor.',
         'Dying is a way of learning. You\'re a very productive student.',
         'I blinked for one second. Again?',
         'Relax. I\'m here. Not sure that\'s a good thing.',
         'I know this trap. Now you do too.'
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
      'levels.hintKeys': '↑ ↓ move along the path · Q / E switch place · Enter to start',
      'levels.none': 'Not cleared yet',
      'levels.next': 'Up next',
      'ch1.name': 'Act I',
      'ch1.title': 'The Border Gate',
      'ch1.desc': 'Your first step into Triangle land. Floors, signs, doors: all theirs, all lying.',
      'ch2.name': 'Act II',
      'ch2.title': 'Town of Things',
      'ch2.desc': 'Here keys bite and ceilings lose patience. Even objects side with the Triangles.',
      'ch3.name': 'Act III',
      'ch3.title': 'Bureau of Lies',
      'ch3.desc': 'Error windows, fake doors, flipping gravity. Triangle bureaucracy.',
      'ev.record': 'New record: {t}',
      'ev.time': 'Time {t} · best {b}',
      'settings.game': 'Game',
      'settings.av': 'Audio & display',
      'settings.data': 'Save data',
      'settings.resetDesc': 'Wipes every level, record and death.',
      'ctl.fullscreen': 'Fullscreen',

      'ch4.name': 'Act IV',
      'ch4.title': 'The Factory',
      'ch4.desc': 'Long halls, buttons, lasers. This is where the spikes are cast.',
      'ch5.name': 'Act V',
      'ch5.title': 'Stone Garden',
      'ch5.desc': 'Those who die here turn to stone. So will you. Your last three deaths become a bridge.',

      'l25.title': 'The Long Way',
      'l25.hint': 'Press the button and jump right away. Ride the platform to the crumbling step, then across. The first flag is fake: jump over it. After the timed button, do not stop.',
      'l25.s1': 'Do not press that button.',
      'l25.s2': 'Checkpoint. One hundred percent safe.',
      'l26.title': 'Round Trip',
      'l26.hint': 'Take the platform on the way out and save the bridge above for the way back. Once you have the key, climb the step onto the bridge and run. Cross lasers while they are off.',
      'l26.s1': 'The door is here. The key is... a bit further.',
      'l26.s2': 'The bridge works once. Think.',
      'l27.title': 'Double Shift',
      'l27.hint': 'Walk over the first button and wait on the second: the gate opens when your shadow steps on the first. At the last gate, stand on the button for a second, then run to the gate; your shadow holds it for you.',
      'l27.s1': 'This gate takes two. Are you alone?',
      'l27.s2': 'Someone holds the button. Someone walks through.',
      'l28.title': 'Upside-Down Shift',
      'l28.hint': 'Press the button, jump in the blue zone, and pass the gate along the ceiling before time runs out. The ceiling button opens the floor gate. In the second half, flip while the laser is off.',
      'l28.s1': 'The clock is ticking. The gate is on the ceiling.',
      'l29.title': 'Engine Room',
      'l29.hint': 'The third platform will not carry you long; jump when it shakes. Watch the laser rhythm before stepping on the bridge; you cannot stop once you are on it. The door flees onto the wall: use the spring on the right.',
      'l29.s1': 'Do not look down.',
      'l29.s2': 'Once you are on the bridge, there is no stopping. Watch the rhythm first.',
      'l30.title': 'Last Shift',
      'l30.hint': 'Jump over the button (on the way back too). Save the bridge for the return. The first flag is fake. Press the button on the right before taking the key so the gate is open for your return.',
      'l30.s1': 'This time, really do not press it.',
      'l30.s2': 'Remember the way you came? Good. Run.',

      'l31.title': 'Stepping Stone',
      'l31.hint': 'The strip is too long to jump. Fall onto the spikes on purpose: where you die turns to stone, step on it next time. Only your last 3 deaths count; R clears the stones.',
      'l31.s1': 'Dying is an option too.',

      'l32.title': 'Sacrifice',
      'l32.hint': 'The gate is open only while the button is held. Stand on the button and let the laser turn you to stone there. Then build a two-stone bridge. Die once too often and the oldest stone, the one on the button, is gone.',
      'l32.s1': 'Some doors take a toll.',

      'l33.title': 'Two Shadows',
      'l33.hint': 'Wait about a second on the first and second buttons, then step on the third. Your shadows will be on the other two right then. Stay longer than a second and your shadow walks into you.',
      'l33.s1': 'Three buttons, one person. Or is it?',

      'l34.title': 'Center of Mass',
      'l34.hint': 'Jump over the first cube and enter the tunnel small. After the tunnel, grab the high cube and smash the wall. Before the wooden bridge, jump and touch the purple cube.',
      'l34.s1': 'Everything in the right order.',

      'l35.title': 'Build a Bridge',
      'l35.hint': 'On the way there, die on the spikes to build a bridge of stones. Keep them close together: on the way back, with the key chasing you, you jump across them.',
      'l35.s1': 'The door is here. The key is there. Spikes in between.',

      'l36.title': 'Zero Hour',
      'l36.hint': 'Press two buttons with your shadow, build a stone bridge, then stand on the last button and let your shadow turn you to stone.',
      'l36.s1': 'One last time: use everything.',
      'l36.s2': 'Stop here. Wait. Trust me.',

      'ev.cp': 'Checkpoint.',
      'ev.gate': 'Gate open.',
      'btn.hold': 'HOLD',
      'die.cp': 'The checkpoint exploded. I told you not to trust that either.',
      'die.gate': 'The gate closed on you. Timing, Square.',
      'die.laser': 'You can\'t pass while the laser is on. Listen to the rhythm.',

      'ch6.name': 'Act VI',
      'ch6.title': 'Clock Tower',
      'ch6.desc': 'Every jump swaps the pink and blue blocks. The tower can count; so should you.',

      'l37.title': 'Odd Even',
      'l37.hint': 'Your first jump makes the blue blocks solid: jump to the block that is not there yet. After the spike the wall turns solid; jump once more on the spot.',
      'l37.s1': 'Every jump changes the world.',
      'l38.title': 'Counter',
      'l38.hint': 'Jump once before the first wall. Between the last two spikes, jump one extra time; then you land on top of the blue block after the last spike and the wall stays open.',
      'l38.s1': 'Pink wall: passable after an odd number of jumps.',
      'l38.s2': 'Do not jump inside a ghost block. It turns solid.',
      'l39.title': 'Fixed Point',
      'l39.hint': 'Jump to blue, then pink. Jump forward off pink and die on the spikes: your stone becomes a step. Next try, jump to the stone and across.',
      'l39.s1': 'Blocks come and go. Stone stays.',
      'l40.title': 'Someone Is Counting',
      'l40.hint': 'After the spike, jump once more so the blue block stays a ghost. Wait on the second button, inside the block; the gate opens when your shadow steps on the first. In the pit: blue, pink, far side.',
      'l40.s1': 'Your shadow jumps too, but it does not count. You do.',
      'l41.title': 'Stay on the Rails',
      'l41.hint': 'Stand at the back of the platform and clear the laser with a short hop. Before the blue block, jump once more on the spot. After the second laser the pink block is a ghost; leave it alone.',
      'l41.s1': 'The platform waits. The blocks do not.',
      'l42.title': 'Overtime',
      'l42.hint': 'On the way out: one jump, the spike, then blue and pink across the pit. Jump onto the ledge for the key and walk off it. On the way back, jump once before the wall; the rest is the way you came.',
      'l42.s1': 'The door is here. Count your way out, count your way back.',
      'l42.s2': 'You jump to get up. You do not jump to get down.',

      'die.phase': 'You were inside the block. You forgot to count; I didn\'t.',

      "ch7.name": "Act VII",
      "ch7.title": 'Watchtower',
      "ch7.desc": 'Face the arrow and the block turns solid. Dot is close. But the tower is watching you too.',
      "l43.title": "Point of View",
      "l43.hint": "Green arrows are solid while facing right; orange while facing left. Jump from green toward orange, tap left before landing, then release the keys. Jump right to the far bank.",
      "l43.s1": "Face the arrow. Make it solid.",
      "l43.s2": "Look back to move forward.",
      "l44.title": "Blind Spot",
      "l44.hint": "Board the middle of the platform. Tap left, then release the direction keys. The platform carries you right through the green wall while you face left. Do not face right until fully clear. Jump right when near the far bank.",
      "l44.s1": "Do not watch the road. Let the platform drive.",
      "l45.title": "Return Route",
      "l45.hint": "Walk right across the lower green bridge. Collect the key on the right. Turning left removes that bridge: climb the step and jump left onto the upper orange bridge to return.",
      "l45.s1": "There is a way out. What about back?",
      "l45.s2": "The high road is for coming back.",
      "l46.title": "Eye Contact",
      "l46.hint": "Pass the first button and jump onto the green block. Face left to fall onto the second button inside it; your shadow opens the gate at the first. Jump straight up; face right only after rising above the block. Face right on the last bridge.",
      "l46.s1": "Your shadow does not decide. You do.",
      "l47.title": "Upside-Down View",
      "l47.hint": "Jump in the blue zone on the right to fall upward. Face left and cross the orange ceiling; jump downward over the ceiling spike. Jump in the left blue zone to return to the floor.",
      "l47.s1": "Even upside down, left is left.",
      "l48.title": "Last Look",
      "l48.hint": "Face left on the platform to pass the wall. After the checkpoint, jump from green to orange and face left before landing. After the last checkpoint walk right into the orange wall: the real exit is inside. The door on the far right is fake.",
      "l48.s1": "You cannot close your eyes. You can turn away.",
      "l48.s2": "Look at the exit. Not behind you.",
      "die.gaze": 'The block you faced turned solid. You were inside it. Mind what you look at.',

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

