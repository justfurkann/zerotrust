# Zero Trust

Trol platform oyunu. Tabelaya, kapıya, zemine, hiçbir şeye güvenme.

## Yayın

`main`'e her birleştirmede `.github/workflows/pages.yml` oyunu GitHub Pages'e yayınlar: **https://zerotrust.studymode.fun**
(DNS: studymode.fun Vercel'de; `zerotrust` için `justfurkann.github.io` CNAME kaydı. Alan adı repo ayarlarında: Settings → Pages.)

Eski adres `zerotrust-game.netlify.app` artık oyunu açmaz: `netlify-move/` sayfası tarayıcıdaki kaydı okuyup
`#import=` ile yeni adrese taşır, yeni site de onu kendi kaydıyla birleştirir (`js/game.js`: `readImport`, `mergeSaves`).

## Hikâye

Kare ile en yakın dostu Nokta otururken Üçgen askerleri Nokta'yı kaçırır. Kare onu kurtarmak için yola çıkar.
Yol boyunca tek rehberi Sıfır'dır: tatlı, gizemli, tek gözlü bir küre. Oyundaki bütün sözleri o söyler ve çoğu zaman yalan söyler.
Yolculuk sekiz yerden geçer (Sınır Kapısı, Eşyalar Kasabası, Yalan Dairesi, Fabrika, Taş Bahçesi, Saat Kulesi, Gözetleme Kulesi, Taht Odası).
Her yere ilk girişte Sıfır konuşur, bazen uzaktan Nokta'nın sesi gelir. Sonunu söylemeyelim; oyunun adı bir ipucu.

- 36 bölümlük hikâye yolculuğu, sekiz yer. İlk yerler tek ekranlık, tek fikirli bölümler; sonrakiler öğrendiğini sana karşı kullanır
- Perde IV uzun, çok aşamalı bölümlerdir: kamera kayar, kayıt noktaları vardır, düğmeler kapı açar, lazerlerin ritmi, hareketli platformlar ve gidişin bir de dönüşü olur
- Perde V'te ölüm bir kaynaktır: son üç ölümün taşa döner. Taşlardan köprü kurar, düğmeyi taşınla basılı tutarsın
- Perde VI'da her zıplayış pembe ve mavi blokları yer değiştirir: hangi bloğun katı olacağı kaç kez zıpladığına bağlıdır
- Perde VII: Bakış Açısı. Ok blokları baktığın yöne göre katılaşır; taşıtta arkana bak, havada yüzünü çevir, dönüş yolunu yukarıda ara.
- Ana menüde oyun arka planda kendi kendine oynar; bölüm seçiminde her bölümün küçük haritası görünür
- Prosedürel müzik ve ses efektleri (dosyasız, Web Audio)
- Bölüm başına en iyi süre ve ölüm sayısı, duruma göre alaycı mesajlar
- Türkçe / English
- Yalnızca masaüstü. Telefon ve tabletten girenlere "PC'den gir" ekranı gösterilir.
- İlerleme ve ayarlar tarayıcıda (`localStorage`) saklanır.


## Hikâye

Kare ile dostu Nokta'yı Üçgenler kaçırır. Yolu gösteren tek kişi, süzülen tek gözlü gizemli bir varlık: **Sıfır**.
Tek bir kuralı vardır: hiçbir şeye güvenme. Ona bile.

Sıfır oyunun anlatıcısıdır: menüde karşılar (yüzüne tıklayınca konuşmaya devam eder), oyun içi bildirimleri o söyler.
Açılış sahnesi ilk oyunda kendiliğinden oynar, menüden "Hikâyeyi izle" ile tekrar izlenir. Kod: `js/story.js`.

## Kontroller

| Tuş | İşlev |
| --- | --- |
| A / D, ← / → | Hareket |
| W, Space, ↑ | Zıpla |
| R | Bölümü yeniden başlat |
| Esc | Duraklat |
| F | Tam ekran |
| Yön tuşları | Menülerde gezinme |
| Q / E | Bölüm seçiminde perde değiştir |

## Yapı

Build adımı yok, düz statik dosyalar. `index.html` doğrudan açılabilir ya da herhangi bir statik sunucuya (Vercel vb.) konabilir.

```
index.html      ekranlar ve HUD
css/style.css   arayüz
js/i18n.js      TR / EN metinleri
js/audio.js     Web Audio ile üretilen sesler
js/story.js     anlatıcı Sıfır, açılış sahnesi, konuşma kutusu
js/levels.js    bölüm haritaları (32×18 kare ızgara) ve tuzaklar
js/game.js      fizik, çizim, ekran akışı
tools/          otomatik oyuncu ve bölüm çözümleri (yalnızca geliştirme için)
```

Fizik saniyede sabit 60 adım çalışır, yani oyun hızı monitörün yenileme hızına bağlı değildir.
Hareket ivmeli; zıplamada coyote time, zıplama tamponu ve değişken yükseklik (kısa bas = alçak zıpla) var.

## Bölüm yazmak

Bölümler `js/levels.js` içinde anahtarla (`l1`, `l25`, `f1` …) tanımlanır. Hangi bölümün hangi yerde, hangi sırayla oynanacağını
dosyanın sonundaki `STORY` listesi belirler; listede olmayan bölümler `ZT.ARCHIVE`'dadır (silinmez, anahtarını `STORY`'ye eklemek geri getirir).
Kayıt bölüm anahtarına göre taşındığı için sırayı değiştirmek oyuncunun ilerlemesini bozmaz.
Perde arası konuşmalar `js/i18n.js` içinde `chapter.chN` anahtarlarındadır (`"zero:smug|metin"` biçiminde: kim, yüz ifadesi, söz).

Her bölüm küçük bir çizim fonksiyonuyla kurulur:

```js
b.fill(0, 14, 32, 4, '#');   // zemin
b.fill(13, 16, 4, 1, '^');   // diken
```

Kare tipleri: `#` zemin, `h` zararsız sahte diken, `~` sahte zemin, `=` çöken kare, `f` sahte çöken kare, `w` zayıf zemin, `c` çatlak duvar (gizli geçit), `?` gizli blok, `x` görünmez tavan dikeni, `^` / `v` diken, `S` yay.
Tuzaklar (`trapdoor`, `pop`, `drop`, `slide`, `invert`, `chase`) oyuncunun merkezi tetik alanına girince çalışır.
Diğer nesneler: `key` (kovalayan anahtar + kilitli kapı), `shy` (zıplayınca kaçan platform), `ceil` (ilerlemezsen inen tavan),
`cube` (devleştiren küp), `hud` (düşen bölüm başlığı), `fakeGhost` (radarın sahte izi), `clone` (bir saniye arkandan gelen gölge),
`window` (platform olan sahte hata penceresi), `gflip` (zıplayınca yerçekimini çeviren alan), `decoy` (sahte kapı),
`revenge` (önceki ölüm noktaların tuzağa döner).

Perde IV nesneleri: `cp` (kayıt noktası; `fake: true` olanı patlar), `btn` (düğme; `timed` süreli, `hold` basılıyken, `ceil` tavanda),
`gate` (kapı; `id` ya da `ids` ile düğmelere bağlanır, `latch` açılınca açık kalır, `inv` basınca kapanır),
`mover` (hareketli platform; `drop` fazla durursan düşer), `laser` (`on` / `off` / `phase` ile ritim).
Düğme ile bağlı olduğu kapı aynı renkte çizilir. Gölge (`clone`) de düğmelere basabilir.
Perde V nesneleri: `stone` (`max` kadar son ölüm, öldüğün karede taşa döner; taş düğmeye basar, R taşları siler),
`cube` için `kind: 'shrink'` (küçültür).
Perde VI: `phase` nesnesi olan bölümde `A` kareleri başta katı, `B` kareleri hayalettir ve her zıplayışta yer değiştirirler
(yay sayılmaz, gölgenin zıplayışı sayılmaz). Katılaşan bloğun içinde kalan oyuncu ölür.
Perde VII: `gaze` nesnesi ve `>` / `<` kareleri. Okun yönüne bakarken katı, aksi yönde hayalettirler. Son bakış yönü tuşlar bırakılınca korunur; hız, gölge ve farenin konumu etkilemez. İçindeyken katılaştırmak öldürür.
Bölüm tanımına `cols: 64` gibi bir genişlik verirsen bölüm ekrandan geniş olur ve kamera oyuncuyu takip eder.

## Bölümleri otomatik denemek

Fizik deterministik olduğu için bölümler kare kare oynatılıp geçilebildiği doğrulanabilir.
`index.html?zttest` adresi küçük bir test kancası açar; `tools/playtest.js` bunu kullanır (Playwright gerekir):

```bash
node tools/playtest.js tools/solutions.js

# Tarayıcı kurulamayan ortamlarda aynı fizik, Node VM + minimal DOM ile:
ZT_NODE=1 node tools/playtest.js tools/solutions.js
```

Taş bölümlerinde `RD` / `D` adımı "burada bilerek öl" demektir; araç ölümü bekler ve yeniden doğmayı bekleyip devam eder.
Çözümler bölüm anahtarıyla yazılır (`node tools/playtest.js tools/solutions.js l25 f2`); arşivdeki bölümler atlanır.
`node tools/checks.js` tarayıcısız bütünlük denetimlerini (çeviriler, kayıt taşıma, kararlılık) çalıştırır.
Yeni bir bölüm yazdığında çözümünü `tools/solutions.js` içine ekle; bölüm gerçekten bitirilebiliyor mu, böyle anlaşılır.


Node modu görsel DOM düzenini ve Web Audio çıktısını doğrulamaz. Sistem Chromium kullanmak için tarayıcı modunda `CHROMIUM_PATH=/usr/bin/chromium` verilebilir.
