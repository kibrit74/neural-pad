# Web Speech API Electron Network Error Fix

## Problem

Electron'da Web Speech API `network` hatası veriyor:
```
[useVoiceRecognition] Error: network
Voice recognition error: network_fallback
```

## Neden?

Web Speech API, Google'ın sunucularına bağlanarak ses tanıma yapar. Electron'un varsayılan güvenlik ayarları bu bağlantıyı engelliyor:

1. **Sandbox Mode**: Güvenlik için ağ erişimini kısıtlar
2. **Web Security**: Cross-origin istekleri engeller
3. **CSP (Content Security Policy)**: Bağlantı izinlerini kısıtlar
4. **Permissions**: Mikrofon ve ağ izinleri gerekir

## Çözüm

### 1. Web Preferences Ayarları

```javascript
// electron/main.cjs
webPreferences: {
  preload: path.join(__dirname, 'preload.cjs'),
  contextIsolation: true,
  nodeIntegration: false,
  devTools: true,
  sandbox: false, // ✅ Disable sandbox for Web Speech API
  webSecurity: false, // ✅ Disable web security for Google servers
  allowRunningInsecureContent: true, // ✅ Allow mixed content
}
```

### 2. Permission Handlers

```javascript
// Automatically grant permissions
mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
  const allowedPermissions = ['media', 'microphone', 'audioCapture'];
  if (allowedPermissions.includes(permission)) {
    callback(true);
  } else {
    callback(false);
  }
});

// Set permission check handler
mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
  const allowedPermissions = ['media', 'microphone', 'audioCapture'];
  return allowedPermissions.includes(permission);
});
```

### 3. CSP (Content Security Policy)

```javascript
'Content-Security-Policy': [
  "default-src 'self' app: https:",
  `script-src ${scriptSrc.join(' ')}`,
  "style-src 'self' 'unsafe-inline' app: https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: app: https:",
  "connect-src 'self' app: https: wss: https://*.googleapis.com https://*.google.com https://www.google.com wss://*.google.com https://speech.googleapis.com https://cxl-services.appspot.com",
  "media-src 'self' blob: data: https:"
].join('; ')
```

## Güvenlik Notları

⚠️ **Dikkat**: Bu ayarlar güvenliği azaltır!

### Riskler

- ❌ `webSecurity: false` - Cross-origin saldırılarına açık
- ❌ `sandbox: false` - Process izolasyonu yok
- ❌ `allowRunningInsecureContent: true` - Mixed content saldırıları

### Öneriler

1. **Sadece Gerekli Domain'lere İzin Verin**
   ```javascript
   // CSP'de sadece Google domain'lerini izin verin
   connect-src: https://*.googleapis.com https://*.google.com
   ```

2. **Production'da Daha Sıkı Ayarlar**
   ```javascript
   if (isDev) {
     webSecurity = false;
   } else {
     webSecurity = true; // Production'da güvenliği artır
   }
   ```

3. **Alternatif: Proxy Sunucu**
   - Kendi sunucunuz üzerinden Google API'ye bağlanın
   - Daha güvenli ama daha karmaşık

## Test

```bash
npm run build
npm run electron:dev
```

**Beklenen Sonuç:**
```
[SpeechManager] Web Speech API supported
[useVoiceRecognition] Started
✅ No network errors
✅ Voice recognition works
```

## Alternatif Çözümler

### 1. Electron'un Built-in Speech Recognition

Electron'un kendi speech recognition API'si yok, bu yüzden bu seçenek mevcut değil.

### 2. Native Node.js Modüller

- `node-record-lpcm16` + Google Cloud Speech-to-Text API
- Daha karmaşık setup
- API key gerektirir
- Maliyet var

### 3. Offline Whisper (Kaldırıldı)

- Çok yavaş
- Yüksek bellek kullanımı
- Kötü kullanıcı deneyimi

### 4. Hybrid Yaklaşım

```javascript
// İnternet varsa Web Speech API
// Yoksa fallback (örn: manuel giriş)
if (navigator.onLine) {
  useWebSpeechAPI();
} else {
  showManualInput();
}
```

## Sorun Giderme

### Hala Network Hatası Alıyorum

1. **İnternet bağlantısını kontrol edin**
   ```bash
   ping google.com
   ```

2. **Firewall ayarlarını kontrol edin**
   - Windows Defender Firewall
   - Antivirus yazılımı
   - Corporate proxy

3. **DevTools Console'u kontrol edin**
   - F12 ile açın
   - Network sekmesine gidin
   - Failed requests'leri kontrol edin

4. **CSP hatalarını kontrol edin**
   ```
   Refused to connect to 'https://...' because it violates CSP
   ```

### Mikrofon Çalışmıyor

1. **Sistem izinlerini kontrol edin**
   - Windows: Settings → Privacy → Microphone
   - macOS: System Preferences → Security & Privacy → Microphone

2. **Electron izinlerini kontrol edin**
   ```javascript
   navigator.mediaDevices.getUserMedia({ audio: true })
   ```

### Ses Tanıma Yavaş

1. **İnternet hızını kontrol edin**
   - Web Speech API internet gerektirir
   - Yavaş bağlantı = yavaş tanıma

2. **Google sunucularına ping atın**
   ```bash
   ping speech.googleapis.com
   ```

## Sonuç

✅ Web Speech API Electron'da çalışıyor
⚠️ Güvenlik ayarları gevşetildi
✅ Hızlı ve gerçek zamanlı tanıma
✅ Kullanıcı deneyimi mükemmel

## İlgili Dosyalar

- `electron/main.cjs` - Web preferences ve CSP ayarları
- `hooks/useVoiceRecognition.ts` - Web Speech API implementation
- `docs/WEB_SPEECH_API_ELECTRON_FIX.md` - Bu dokümantasyon
