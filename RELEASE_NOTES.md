# Neural Pad – v0.1.0 Yayın Notları

Bu sürüm, tablo sıralama işlevinin düzeltilmesi, yazı tipi seçeneklerinin genişletilmesi ve Windows için paketlenmiş dağıtımın hazırlanması gibi önemli iyileştirmeler içerir.

## Öne Çıkanlar
- Tablo sütunlarında "A→Z" ve "Z→A" sıralama artık doğru çalışır.
- Yazı tipi aileleri 10+ seçeneğe çıkarıldı.
- Punto aralığı 10pt–50pt olarak genişletildi.
- Windows için taşınabilir paket `neural-pad-win.zip` hazır.

## Yenilikler
- Genişletilmiş yazı tipi listesi: Roboto, Open Sans, Lato, Montserrat, Nunito, Merriweather, Lora, Playfair Display, Raleway, Ubuntu (ve daha fazlası).
- Yazı boyutu seçenekleri 10pt’ten 50pt’ye kadar.

## Düzeltmeler
- Tablo sıralama: `ContextMenu` içinde hücre DOM konumundan Tiptap pozisyonuna güvenli seçim eşlemesi; başlık satırı korunur.
- `tableUtils`: `editor.isActive('table')` kontrolleri kaldırıldı; atalar üzerinden tablo bulunarak komutlar güvenilir çalışır.
- TypeScript: `Editor.tsx` içinde `setContent(content, { emitUpdate: false })` ile uyumlu seçenek nesnesi kullanıldı.

## İyileştirmeler
- Menü eylemleri, tablo odaklı komutlar için seçim konumlandırmayı otomatikleştirir.
- Tablo sınıfı/kenarlığı işlemlerinin hata toleransı artırıldı.

## İndirme ve Çalıştırma (Windows)
- Zip arşivi: `dist/neural-pad-win.zip`
- Kullanım:
  1. Zip arşivini çıkarın.
  2. `dist/win-unpacked/Neural Pad.exe` dosyasını çalıştırın.

## Bilinen Hususlar
- GitHub Actions workflow (`.github/workflows/release.yml`) varsayılan olarak `.exe` installer bekler. Mevcut `package.json` yapılandırmasında Windows hedefi `dir` olduğu için installer üretilmez.
  - Installer istiyorsanız: `build.win.target: nsis` yapın ve workflow’daki `files` desenini `.exe` için koruyun.
  - Zip dağıtımı istiyorsanız: Workflow’daki `files` desenini `dist/*.zip` veya `dist/win-unpacked/**` ile güncelleyin.

## Sürüm Bilgisi
- Önerilen etiket: `v0.1.0`
- `package.json` sürümü: `0.0.0` — Yayın öncesi sürüm artırımı önerilir (örn. `0.1.0`).

---
Sorularınız veya geri bildirimleriniz için Issues açabilirsiniz.