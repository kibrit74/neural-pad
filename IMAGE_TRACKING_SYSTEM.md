# Image Tracking System

## Özet

Editöre eklenen resimlerin veritabanında takip edilmesi ve kullanılmayan resimlerin temizlenebilmesi için image tracking sistemi eklendi.

## Nasıl Çalışıyor?

### 1. Resim Yükleme
```
Kullanıcı resim ekler
  ↓
Resim dosya sistemine kaydedilir (app://images/hash.png)
  ↓
Veritabanında kaydedilir (images tablosu)
  ↓
HTML'de referans verilir (<img src="app://images/hash.png">)
```

### 2. Resim Takibi
- Her resim yüklendiğinde `images` tablosuna eklenir
- SHA-256 hash ile unique ID
- `createdAt`: İlk yüklenme zamanı
- `lastUsedAt`: Son kullanım zamanı

### 3. Kullanım Güncelleme
- Not kaydedildiğinde içindeki resimler taranır
- Her resmin `lastUsedAt` alanı güncellenir
- Böylece hangi resimlerin aktif kullanıldığı bilinir

## Database Schema

### images Tablosu
```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,  -- hash.png
  hash TEXT NOT NULL UNIQUE,      -- SHA-256 hash
  size INTEGER NOT NULL,          -- Dosya boyutu (bytes)
  createdAt DATETIME NOT NULL,    -- İlk yüklenme
  lastUsedAt DATETIME NOT NULL,   -- Son kullanım
  INDEX(hash),
  INDEX(lastUsedAt)
);
```

## API Fonksiyonları

### trackImage
```typescript
await db.trackImage(filename, hash, size);
```
Yeni resim kaydeder veya mevcut resmin `lastUsedAt`'ini günceller.

### updateImageUsage
```typescript
await db.updateImageUsage(hash);
```
Resmin `lastUsedAt` alanını günceller (not kaydedildiğinde).

### getUnusedImages
```typescript
const unusedImages = await db.getUnusedImages(30); // 30 gün kullanılmayan
```
Belirtilen gün sayısından uzun süredir kullanılmayan resimleri döner.

### deleteImageRecord
```typescript
await db.deleteImageRecord(hash);
```
Veritabanından resim kaydını siler.

## Kullanım Senaryoları

### Resim Ekleme
```typescript
// Editor.tsx - handleImageUpload
const buffer = await file.arrayBuffer();
const url = await window.electron.files.saveImage(new Uint8Array(buffer));
// url: "app://images/abc123...png"
// Otomatik olarak veritabanına kaydedilir
```

### Not Kaydetme
```typescript
// utils/db.cts - saveNote
// Not içindeki tüm resimler taranır
// Her resmin lastUsedAt'i güncellenir
await db.saveNote(note);
```

### Temizlik (Gelecekte)
```typescript
// Kullanılmayan resimleri bul
const unusedImages = await db.getUnusedImages(30);

// Dosya sisteminden sil
for (const filename of unusedImages) {
  await fs.unlink(path.join(imagesDir, filename));
  await db.deleteImageRecord(hash);
}
```

## Avantajlar

✅ **Orphan image detection**: Hangi resimlerin kullanılmadığı bilinir
✅ **Disk space management**: Kullanılmayan resimler temizlenebilir
✅ **Deduplication**: Aynı resim tekrar yüklenmez (hash kontrolü)
✅ **Usage tracking**: Her resmin ne zaman kullanıldığı bilinir
✅ **Automatic cleanup**: Eski resimleri otomatik temizleme (gelecekte)

## Gelecek İyileştirmeler

- [ ] Otomatik cleanup job (30 gün kullanılmayan resimleri sil)
- [ ] Settings'te cleanup ayarları (gün sayısı, otomatik/manuel)
- [ ] Image usage statistics (kaç not kullanıyor, toplam boyut)
- [ ] Bulk image operations (tümünü temizle, export, vb.)
- [ ] Image compression (büyük resimleri otomatik küçült)

## Notlar

- Resimler zaten dosya sistemine kaydediliyor (mevcut özellik)
- Bu sistem sadece tracking ekliyor (hangi resimler kullanılıyor)
- Geriye dönük uyumlu (mevcut resimler etkilenmiyor)
- Migration otomatik çalışıyor (images tablosu oluşturuluyor)
