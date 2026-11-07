# Zero Trust

Trol platform oyunu. Tabelaya, kapıya, zemine, hiçbir şeye güvenme.

- 5 bölüm ve 1 bonus mod (kaçan buton)
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

## Yapı

Build adımı yok, düz statik dosyalar. `index.html` doğrudan açılabilir ya da herhangi bir statik sunucuya (Vercel vb.) konabilir.

```
index.html      ekranlar ve HUD
css/style.css   arayüz
js/i18n.js      TR / EN metinleri
js/audio.js     Web Audio ile üretilen sesler
js/levels.js    bölüm verileri
js/game.js      fizik, çizim, ekran akışı
```

Fizik saniyede sabit 60 adım çalışır, yani oyun hızı monitörün yenileme hızına bağlı değildir.
