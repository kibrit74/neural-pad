# Electron Cache Temizleme

## Sorun

Kod değişiklikleri Electron'da görünmüyor veya eski kod çalışmaya devam ediyor.

## Çözüm

### 1. Build Klasörünü Temizle

```bash
# dist klasörünü sil
rm -rf dist

# Yeniden build et
npm run build
```

### 2. Electron Cache'i Temizle

```bash
# node_modules/.vite klasörünü sil
rm -rf node_modules/.vite

# Yeniden build et
npm run build
```

### 3. Tam Temizlik (Önerilen)

```bash
# Tüm build artifactlarını temizle
rm -rf dist
rm -rf node_modules/.vite
rm -rf .cache

# Yeniden build et
npm run build

# Electron'u başlat
npm run electron:dev
```

### 4. Windows PowerShell İçin

```powershell
# dist klasörünü sil
Remove-Item -Recurse -Force dist

# node_modules/.vite klasörünü sil
Remove-Item -Recurse -Force node_modules/.vite

# .cache klasörünü sil (varsa)
Remove-Item -Recurse -Force .cache

# Yeniden build et
npm run build

# Electron'u başlat
npm run electron:dev
```

### 5. Hard Refresh (Electron İçinde)

Electron uygulaması çalışırken:

1. **Ctrl+R** (Windows/Linux) veya **Cmd+R** (Mac) - Sayfayı yenile
2. **Ctrl+Shift+R** (Windows/Linux) veya **Cmd+Shift+R** (Mac) - Hard refresh
3. **F12** ile DevTools'u aç → Application → Clear Storage → Clear site data

## Kontrol

Electron'u başlattıktan sonra console'da şu log'ları görmelisiniz:

```
[SpeechManager] Electron Detection: {
  isElectron: true,
  windowElectron: true,
  windowElectronAPI: true,
  windowIsElectron: true,
  platform: 'win32'
}

[VoiceRecognitionUnified] ✅ Using Electron Whisper (offline)
```

Eğer hala "Using Web Speech API (online)" görüyorsanız:

1. Uygulamayı tamamen kapatın
2. Tam temizlik yapın (yukarıdaki adım 3)
3. Yeniden build edin
4. Electron'u başlatın

## Notlar

- Her kod değişikliğinden sonra `npm run build` çalıştırın
- Development modunda hot reload çalışmaz, manuel build gerekir
- Cache sorunları genellikle build artifactlarından kaynaklanır
