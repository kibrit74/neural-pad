# 🚀 Neural Pad - Build ve Release Rehberi

Bu rehber, Neural Pad uygulamasını farklı platformlar için build etme ve GitHub'da yayınlama sürecini adım adım açıklar.

## 📋 İçindekiler

1. [Ön Hazırlık](#ön-hazırlık)
2. [Build İşlemleri](#build-işlemleri)
3. [GitHub Release Oluşturma](#github-release-oluşturma)
4. [Landing Page Güncelleme](#landing-page-güncelleme)
5. [Sorun Giderme](#sorun-giderme)

---

## 🔧 Ön Hazırlık

### Gereksinimler

- **Node.js** v16 veya üzeri
- **npm** veya **yarn**
- **Git** kurulu olmalı
- Platform-specific gereksinimler:
  - **Windows**: Windows 7 veya üzeri
  - **macOS**: macOS 10.13 veya üzeri (Apple Silicon için macOS 11+)
  - **Linux**: Modern bir Linux dağıtımı

### Proje Kurulumu

```bash
# Repository'yi klonla
git clone https://github.com/kibrit74/neural-pad.git
cd neural-pad

# Bağımlılıkları yükle
npm install
```

---

## 🔨 Build İşlemleri

### 1. Geliştirme Modunda Test

Önce uygulamanın düzgün çalıştığından emin olun:

```bash
# Web versiyonu
npm run dev

# Electron versiyonu
npm run dev:electron
```

### 2. Platform-Specific Build

#### Windows için Build (.exe)

```bash
npm run dist:win
```

**Çıktı:**
- `dist/Neural Pad Setup 1.0.0.exe` - Kurulum dosyası
- `dist/Neural Pad Setup 1.0.0.exe.blockmap` - Güncelleme için

**Not:** Windows build'i herhangi bir platformda yapılabilir.

#### macOS için Build (.dmg)

```bash
npm run dist:mac
```

**Çıktı:**
- `dist/Neural Pad-1.0.0.dmg` - macOS kurulum dosyası
- `dist/Neural Pad-1.0.0-arm64.dmg` - Apple Silicon (M1/M2)
- `dist/Neural Pad-1.0.0-x64.dmg` - Intel Mac

**Not:** macOS build'i sadece macOS'ta yapılabilir.

#### Linux için Build (.AppImage)

```bash
npm run dist:linux
```

**Çıktı:**
- `dist/Neural Pad-1.0.0.AppImage` - Linux kurulum dosyası

**Not:** Linux build'i Linux veya macOS'ta yapılabilir.

#### Tüm Platformlar için Build

```bash
npm run dist:all
```

**Uyarı:** Bu işlem uzun sürer ve tüm platformlar için dosyalar oluşturur.

---

## 📦 Build Dosyaları

Build tamamlandığında `dist/` klasöründe şu dosyalar oluşur:

```
dist/
├── Neural Pad Setup 1.0.0.exe           # Windows installer
├── Neural Pad Setup 1.0.0.exe.blockmap  # Windows update file
├── Neural Pad-1.0.0.dmg                 # macOS installer (Universal)
├── Neural Pad-1.0.0-arm64.dmg           # macOS Apple Silicon
├── Neural Pad-1.0.0-x64.dmg             # macOS Intel
├── Neural Pad-1.0.0.AppImage            # Linux portable
├── latest.yml                           # Auto-update metadata
└── builder-effective-config.yaml        # Build configuration
```

---

## 🎯 GitHub Release Oluşturma

### Adım 1: GitHub'a Git

1. Tarayıcıda projenizi açın: `https://github.com/kibrit74/neural-pad`
2. Sağ tarafta **Releases** bölümüne tıklayın
3. **Create a new release** butonuna tıklayın

### Adım 2: Release Bilgilerini Gir

**Tag version:**
```
v1.0.0
```

**Release title:**
```
Neural Pad v1.0.0 - AI-Powered Note Taking
```

**Description (örnek):**
```markdown
## 🎉 Neural Pad v1.0.0

AI destekli akıllı not defteri uygulaması!

### ✨ Özellikler

- 🤖 AI Yazma Asistanı (Gemini, OpenAI, Claude)
- 📝 Zengin Metin Editörü (TipTap)
- 🖼️ Görsel Desteği
- 🔐 Şifreli Notlar
- 🏷️ Etiket Sistemi
- 💾 Otomatik Kaydetme
- 🌍 Çoklu Dil Desteği (TR/EN)

### 📥 İndirme

**Windows:**
- [Neural Pad Setup 1.0.0.exe](https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe)

**macOS:**
- [Neural Pad 1.0.0.dmg](https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.dmg) (Universal)
- [Neural Pad 1.0.0 (Apple Silicon)](https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0-arm64.dmg)
- [Neural Pad 1.0.0 (Intel)](https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0-x64.dmg)

**Linux:**
- [Neural Pad 1.0.0.AppImage](https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.AppImage)

### 🔧 Kurulum

**Windows:**
1. `.exe` dosyasını indirin
2. Çift tıklayın ve kurulum sihirbazını takip edin

**macOS:**
1. `.dmg` dosyasını indirin
2. Açın ve Neural Pad'i Applications klasörüne sürükleyin
3. İlk açılışta "Güvenilmeyen geliştirici" uyarısı alırsanız:
   - System Preferences > Security & Privacy > General
   - "Open Anyway" butonuna tıklayın

**Linux:**
1. `.AppImage` dosyasını indirin
2. Çalıştırılabilir yapın: `chmod +x Neural.Pad-1.0.0.AppImage`
3. Çift tıklayarak çalıştırın

### 📝 Değişiklikler

- İlk stabil sürüm
- Tüm temel özellikler eklendi
- Performans optimizasyonları

### 🐛 Bilinen Sorunlar

- Yok (ilk sürüm)

---

**Tam değişiklik listesi:** [CHANGELOG.md](https://github.com/kibrit74/neural-pad/blob/main/CHANGELOG.md)
```

### Adım 3: Dosyaları Yükle

1. **Attach binaries** bölümüne tıklayın
2. `dist/` klasöründen şu dosyaları sürükleyin:
   - `Neural Pad Setup 1.0.0.exe`
   - `Neural Pad-1.0.0.dmg` (veya arm64/x64 versiyonları)
   - `Neural Pad-1.0.0.AppImage`
   - `latest.yml` (otomatik güncelleme için)

### Adım 4: Yayınla

1. **Set as the latest release** işaretli olsun
2. **Publish release** butonuna tıklayın

---

## 🔗 Landing Page Güncelleme

### Otomatik Link Yapısı

Landing page'deki indirme linkleri şu formatta:

```
https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/[DOSYA_ADI]
```

### WelcomeModal.tsx'te Linkler

Dosya: `components/WelcomeModal.tsx`

```typescript
const DOWNLOAD_LINKS = {
    macOS: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.dmg",
    windows: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe",
    linux: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.AppImage"
};
```

### Yeni Sürüm İçin Güncelleme

1. `package.json`'da version'ı artır:
```json
{
  "version": "1.0.1"
}
```

2. `WelcomeModal.tsx`'te linkleri güncelle:
```typescript
// v1.0.0 yerine v1.0.1
const DOWNLOAD_LINKS = {
    macOS: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.1/Neural.Pad-1.0.1.dmg",
    // ...
};
```

3. Yeni build al ve GitHub'a yükle

---

## 🛠️ Sorun Giderme

### Build Hataları

#### "electron-builder not found"
```bash
npm install electron-builder --save-dev
```

#### "Icon not found"
```bash
npm run icon:gen
```

#### macOS'ta "Code signing failed"
```bash
# Geçici çözüm: Code signing'i devre dışı bırak
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run dist:mac
```

### Kurulum Sorunları

#### Windows: "Windows protected your PC"
- **Çözüm:** "More info" > "Run anyway"
- **Kalıcı çözüm:** Uygulamayı code signing ile imzala

#### macOS: "App is damaged and can't be opened"
```bash
# Terminal'de çalıştır:
xattr -cr /Applications/Neural\ Pad.app
```

#### Linux: "Permission denied"
```bash
chmod +x Neural.Pad-1.0.0.AppImage
```

### Güncelleme Sorunları

#### Otomatik güncelleme çalışmıyor
- `latest.yml` dosyasının GitHub release'de olduğundan emin olun
- Uygulama ayarlarında güncelleme kontrolünü etkinleştirin

---

## 📊 Build Süreleri (Yaklaşık)

| Platform | Süre | Dosya Boyutu |
|----------|------|--------------|
| Windows | 3-5 dk | ~150 MB |
| macOS | 5-8 dk | ~200 MB |
| Linux | 3-5 dk | ~180 MB |
| Tümü | 10-15 dk | ~530 MB |

---

## 🔐 Güvenlik Notları

### Code Signing (Önerilen)

**Windows:**
```bash
# Sertifika satın al (Sectigo, DigiCert, vb.)
# electron-builder.yml'e ekle:
win:
  certificateFile: "path/to/cert.pfx"
  certificatePassword: "your-password"
```

**macOS:**
```bash
# Apple Developer hesabı gerekli ($99/yıl)
# Xcode'dan sertifika al
# electron-builder otomatik bulur
```

### Güvenli Dağıtım

1. **HTTPS kullan** - GitHub releases zaten HTTPS
2. **Checksum sağla** - SHA256 hash'leri paylaş
3. **GPG imzala** - Release'leri GPG ile imzala

---

## 📚 Ek Kaynaklar

- [Electron Builder Docs](https://www.electron.build/)
- [GitHub Releases Guide](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto Update Guide](https://www.electron.build/auto-update)

---

## 🎓 Hızlı Komutlar Özeti

```bash
# Geliştirme
npm run dev              # Web versiyonu
npm run dev:electron     # Electron versiyonu

# Build
npm run dist:win         # Windows
npm run dist:mac         # macOS
npm run dist:linux       # Linux
npm run dist:all         # Tüm platformlar

# Yardımcı
npm run icon:gen         # İkonları oluştur
npm run build            # Web build
npm run build:electron   # Electron build
```

---

## 📞 Destek

Sorun yaşıyorsanız:
1. [GitHub Issues](https://github.com/kibrit74/neural-pad/issues) açın
2. [Discussions](https://github.com/kibrit74/neural-pad/discussions) bölümünde sorun
3. E-posta: zubobilisim@gmail.com

---

**Son Güncelleme:** 2025-01-07
**Versiyon:** 1.0.0
**Yazar:** Neural Pad Team
