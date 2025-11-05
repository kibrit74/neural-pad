# Developer Tools (DevTools) Klavye Kısayolları

## Genel Bakış

Electron uygulamasında geliştirici araçlarını (DevTools) açmak için klavye kısayolları eklendi.

## Klavye Kısayolları

### F12
- **Açıklama**: DevTools'u aç/kapat
- **Platform**: Tüm platformlar (Windows, macOS, Linux)
- **Kullanım**: F12 tuşuna basın

### Ctrl+Shift+I (Windows/Linux)
- **Açıklama**: DevTools'u aç/kapat
- **Platform**: Windows ve Linux
- **Kullanım**: Ctrl + Shift + I tuşlarına aynı anda basın

### Cmd+Option+I (macOS)
- **Açıklama**: DevTools'u aç/kapat
- **Platform**: macOS
- **Kullanım**: Cmd + Option + I tuşlarına aynı anda basın

## Özellikler

- ✅ DevTools her zaman etkin (development ve production)
- ✅ Detached mode (ayrı pencerede açılır)
- ✅ Toggle özelliği (açık ise kapatır, kapalı ise açar)
- ✅ Tüm platformlarda çalışır

## Teknik Detaylar

### webPreferences Ayarı

```javascript
webPreferences: {
  devTools: true, // Always enable DevTools
  // ...
}
```

### Klavye Kısayolu Implementasyonu

```javascript
mainWindow.webContents.on('before-input-event', (event, input) => {
  // F12
  if (input.key === 'F12') {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }
  
  // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
  if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }
});
```

## Kullanım Senaryoları

### 1. Console Log'larını Görüntüleme
```javascript
console.log('Test message');
console.error('Error message');
console.warn('Warning message');
```

F12 ile DevTools'u açın ve Console sekmesine gidin.

### 2. Network İsteklerini İzleme
- F12 ile DevTools'u açın
- Network sekmesine gidin
- API isteklerini ve yanıtlarını görüntüleyin

### 3. Element İnceleme
- F12 ile DevTools'u açın
- Elements sekmesine gidin
- DOM yapısını ve CSS stillerini inceleyin

### 4. JavaScript Debugging
- F12 ile DevTools'u açın
- Sources sekmesine gidin
- Breakpoint'ler ekleyin ve debug edin

### 5. Performance Analizi
- F12 ile DevTools'u açın
- Performance sekmesine gidin
- Uygulama performansını analiz edin

## Güvenlik Notları

- DevTools production'da da etkindir
- Kullanıcılar DevTools'u açabilir
- Hassas bilgileri console'a yazdırmayın
- API anahtarlarını log'lamayın

## Sorun Giderme

### DevTools Açılmıyor
1. F12 tuşuna basın
2. Ctrl+Shift+I (Windows/Linux) veya Cmd+Option+I (macOS) deneyin
3. Uygulamayı yeniden başlatın

### DevTools Kapanmıyor
1. Tekrar F12 tuşuna basın
2. DevTools penceresini manuel olarak kapatın
3. Uygulamayı yeniden başlatın

### Kısayollar Çalışmıyor
1. Başka bir uygulama aynı kısayolu kullanıyor olabilir
2. Uygulamanın focus'ta olduğundan emin olun
3. Uygulamayı yeniden başlatın

## Değişiklikler

### Öncesi
```javascript
webPreferences: {
  devTools: isDev, // Sadece development'ta
}
```

### Sonrası
```javascript
webPreferences: {
  devTools: true, // Her zaman etkin
}

// Klavye kısayolları eklendi
mainWindow.webContents.on('before-input-event', (event, input) => {
  // F12 ve Ctrl+Shift+I kısayolları
});
```

## Referanslar

- [Electron DevTools Documentation](https://www.electronjs.org/docs/latest/tutorial/devtools-extension)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Keyboard Shortcuts](https://www.electronjs.org/docs/latest/api/accelerator)

## İlgili Dosyalar

- `electron/main.cjs` - DevTools ayarları ve klavye kısayolları
- `docs/DEVTOOLS_SHORTCUTS.md` - Bu dokümantasyon
