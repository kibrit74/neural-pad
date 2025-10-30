# Değişim Günlüğü (Changelog)

Bu projedeki anlamlı değişiklikler burada listelenir.

## v0.1.0 — 2025-10-30

### Öne Çıkanlar
- Tablo sütunlarında "A→Z" ve "Z→A" sıralama artık düzgün çalışıyor.
- Yazı tipi seçenekleri 10+ aileye çıkarıldı; punto aralığı 10pt–50pt.
- Windows için taşınabilir paket `neural-pad-win.zip` olarak hazırlandı.

### Eklendi
- "Font" menüsüne genişletilmiş yazı tipi ailesi listesi (Roboto, Open Sans, Lato, Montserrat, Nunito, Merriweather, Lora, Playfair Display, Raleway, Ubuntu, vb.).
- "Font Size" menüsünde 10pt–50pt aralığında seçenekler.

### Düzeltildi
- `components/ContextMenu.tsx`: Tabloda hücreye tıklanınca seçim, ProseMirror konumuna güvenli şekilde taşınıyor; sıralama ve tablo komutları artık uygulanıyor.
- `utils/tableUtils.ts`: `editor.isActive('table')` kontrolleri kaldırıldı; üst/ata düğümden tablo tespiti ile komutlar güvenilir çalışıyor.
- `components/Editor.tsx`: `setContent` ikinci parametresi boolean yerine `{ emitUpdate: false }` kullanacak şekilde TypeScript hatası giderildi.

### İyileştirmeler
- Menü eylemleri, tablo içinde güvenli seçim konumlandırma ile çalışacak şekilde güncellendi.
- Tablo sınıfı ve kenarlık sınıfı işlemlerinin güvenilirliği artırıldı.

### Paketleme
- `npm run dist:win` ile `dist/win-unpacked` çıktısı üretildi; `Neural Pad.exe` bu klasörde yer alıyor.
- `dist/neural-pad-win.zip` arşivi oluşturuldu (dağıtım için uygun).

### Bilinen Hususlar
- `.github/workflows/release.yml` şu an `.exe` dosyalarını yayımlamaya ayarlı (NSIS installer bekleniyor). `package.json` içindeki Windows hedefi `dir` olduğu için `.exe` oluşmuyor. İki seçenek:
  - Installer istiyorsanız: `build.win.target` değerini `nsis` yapın ve workflow’daki `files` desenini `.exe` için koruyun.
  - Sadece zip dağıtacaksanız: Workflow’daki `files` desenini `dist/*.zip` veya `dist/win-unpacked/**` ile güncelleyin.

---

Değişiklik önerileri ve takip için GitHub Issues kullanılabilir.