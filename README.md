# Zero Trust

Trol platform oyunu. Tabelaya, kapıya, zemine, hiçbir şeye güvenme.

- 30 bölüm, dört perde. İlk üç perde tek ekranlık, tek fikirli bölümler; sonraki bölümler öğrendiğini sana karşı kullanır
- Perde IV uzun, çok aşamalı bölümlerdir: kamera kayar, kayıt noktaları vardır, düğmeler kapı açar, lazerlerin ritmi, hareketli platformlar ve gidişin bir de dönüşü olur
- Ana menüde oyun arka planda kendi kendine oynar; bölüm seçiminde her bölümün küçük haritası görünür
- Prosedürel müzik ve ses efektleri (dosyasız, Web Audio)
- Bölüm başına en iyi süre ve ölüm sayısı, ölüm izleri, duruma göre alaycı mesajlar
- Türkçe / English
- Yalnızca masaüstü. Telefon ve tabletten girenlere "PC'den gir" ekranı gösterilir.
- İlerleme ve ayarlar tarayıcıda (`localStorage`) saklanır.

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
js/levels.js    bölüm haritaları (32×18 kare ızgara) ve tuzaklar
js/game.js      fizik, çizim, ekran akışı
tools/          otomatik oyuncu ve bölüm çözümleri (yalnızca geliştirme için)
```

Fizik saniyede sabit 60 adım çalışır, yani oyun hızı monitörün yenileme hızına bağlı değildir.
Hareket ivmeli; zıplamada coyote time, zıplama tamponu ve değişken yükseklik (kısa bas = alçak zıpla) var.

## Bölüm yazmak

Bölümler `js/levels.js` içinde küçük bir çizim fonksiyonuyla tanımlanır:

```js
b.fill(0, 14, 32, 4, '#');   // zemin
b.fill(13, 16, 4, 1, '^');   // diken
```

Kare tipleri: `#` zemin, `~` sahte zemin, `=` çöken kare, `f` sahte çöken kare, `w` zayıf zemin, `c` çatlak duvar (gizli geçit), `?` gizli blok, `x` görünmez tavan dikeni, `^` / `v` diken, `S` yay.
Tuzaklar (`trapdoor`, `pop`, `drop`, `slide`, `invert`, `chase`) oyuncunun merkezi tetik alanına girince çalışır.
Diğer nesneler: `key` (kovalayan anahtar + kilitli kapı), `shy` (zıplayınca kaçan platform), `ceil` (ilerlemezsen inen tavan),
`cube` (devleştiren küp), `hud` (düşen bölüm başlığı), `fakeGhost` (radarın sahte izi), `clone` (bir saniye arkandan gelen gölge),
`window` (platform olan sahte hata penceresi), `gflip` (zıplayınca yerçekimini çeviren alan), `decoy` (sahte kapı),
`revenge` (önceki ölüm noktaların tuzağa döner).

Perde IV nesneleri: `cp` (kayıt noktası; `fake: true` olanı patlar), `btn` (düğme; `timed` süreli, `hold` basılıyken, `ceil` tavanda),
`gate` (kapı; `id` ya da `ids` ile düğmelere bağlanır, `latch` açılınca açık kalır, `inv` basınca kapanır),
`mover` (hareketli platform; `drop` fazla durursan düşer), `laser` (`on` / `off` / `phase` ile ritim).
Düğme ile bağlı olduğu kapı aynı renkte çizilir. Gölge (`clone`) de düğmelere basabilir.
Bölüm tanımına `cols: 64` gibi bir genişlik verirsen bölüm ekrandan geniş olur ve kamera oyuncuyu takip eder.

## Bölümleri otomatik denemek

Fizik deterministik olduğu için bölümler kare kare oynatılıp geçilebildiği doğrulanabilir.
`index.html?zttest` adresi küçük bir test kancası açar; `tools/playtest.js` bunu kullanır (Playwright gerekir):

```bash
node tools/playtest.js tools/solutions.js
```

Yeni bir bölüm yazdığında çözümünü `tools/solutions.js` içine ekle; bölüm gerçekten bitirilebiliyor mu, böyle anlaşılır.
