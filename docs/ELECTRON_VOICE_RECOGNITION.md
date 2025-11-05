# Electron Voice Recognition - Offline Whisper

## Genel Bakış

Electron uygulamasında ses tanıma için **offline Whisper modeli** kullanılır. Bu, internet bağlantısı gerektirmez ve tamamen yerel olarak çalışır.

## Neden Web Speech API Değil?

Web Speech API Electron'da **network hatası** verir çünkü:
- Google'ın sunucularına bağlanmaya çalışır
- Electron'un güvenlik politikaları bunu engelleyebilir
- İnternet bağlantısı gerektirir
- Offline çalışmaz

## Whisper Model Avantajları

✅ **Offline Çalışma**: İnternet bağlantısı gerekmez
✅ **Gizlilik**: Ses verileri cihazdan çıkmaz
✅ **Hız**: Yerel işlem daha hızlıdır
✅ **Güvenilirlik**: Network hatalarından etkilenmez
✅ **Çoklu Dil**: 99+ dil desteği

## Teknik Detaylar

### Model

- **Model**: Xenova/whisper-tiny
- **Kütüphane**: @xenova/transformers
- **Runtime**: ONNX Runtime
- **Quantization**: Evet (daha küçük boyut)

### Implementasyon

```typescript
// hooks/useVoiceRecognitionUnified.ts
export const useVoiceRecognitionUnified = (options) => {
  const { isElectron } = speechRecognitionManager.checkSupport();
  
  // Electron'da offline Whisper kullan
  if (isElectron) {
    return useElectronVoiceRecognition(options);
  }
  
  // Web'de Web Speech API kullan
  return useVoiceRecognition(options);
};
```

### Worker Thread

Whisper modeli **worker thread**'de çalışır:
- Main process'i bloklamaz
- UI responsive kalır
- Arka planda model yüklenir

```javascript
// electron/speechWorker.cjs
const recognizer = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny',
  { quantized: true }
);
```

## Kullanım

### 1. Model Ön Yükleme

Model uygulama başlatıldığında otomatik olarak yüklenir:

```typescript
// hooks/useModelPreloader.ts
useEffect(() => {
  if (isElectron) {
    preloadModel();
  }
}, []);
```

### 2. Ses Kaydı

```typescript
const { isRecording, start, stop } = useVoiceRecognitionUnified({
  onResult: (transcript, isFinal) => {
    console.log('Transcript:', transcript);
  }
});

// Kaydı başlat
start();

// Kaydı durdur
stop();
```

### 3. Sonuç İşleme

```typescript
onResult: (transcript, isFinal) => {
  if (isFinal) {
    // Kesin sonuç
    console.log('Final:', transcript);
  } else {
    // Ara sonuç
    console.log('Interim:', transcript);
  }
}
```

## Performans

### Model Boyutu
- **whisper-tiny**: ~75 MB
- **whisper-base**: ~150 MB
- **whisper-small**: ~500 MB

### İşlem Süresi
- **Başlatma**: 2-5 saniye (ilk kez)
- **Transkripsiyon**: 1-3 saniye (4 saniyelik ses için)
- **Bellek**: ~200-300 MB

### Optimizasyonlar
- ✅ Quantized model (daha küçük)
- ✅ Worker thread (non-blocking)
- ✅ Segment-based processing (kısmi sonuçlar)
- ✅ RMS filtering (sessizlik filtreleme)

## Hata Yönetimi

### Network Hatası (Web Speech API)

```javascript
// Otomatik olarak Whisper'a geçiş yapılır
if (error === 'network' || error === 'network_fallback') {
  console.log('Switching to Electron Whisper');
  setUseElectronFallback(true);
}
```

### Model Yükleme Hatası

```javascript
try {
  await initializeRecognizer('Xenova/whisper-tiny');
} catch (error) {
  console.error('Model initialization failed:', error);
  return { success: false, error: error.message };
}
```

## Log Yönetimi

ONNX Runtime uyarıları susturulmuştur:

```javascript
// electron/main.cjs
process.env.ORT_LOGGING_LEVEL = 'error';
process.env.ONNXRUNTIME_LOG_SEVERITY_LEVEL = '3';

// electron/speechWorker.cjs
env.onnx = env.onnx || {};
env.onnx.logSeverityLevel = 3;
```

## Sorun Giderme

### Model Yüklenmiyor

1. İnternet bağlantısını kontrol edin (ilk indirme için)
2. `.cache` klasörünü kontrol edin
3. Uygulamayı yeniden başlatın

### Transkripsiyon Çalışmıyor

1. Mikrofon izinlerini kontrol edin
2. DevTools'da console log'larını kontrol edin
3. Model yüklendiğinden emin olun

### Yavaş Çalışıyor

1. `whisper-tiny` yerine daha küçük model kullanın
2. Segment süresini artırın (4s → 6s)
3. RMS eşiğini artırın (0.02 → 0.03)

## Karşılaştırma

| Özellik | Web Speech API | Whisper (Electron) |
|---------|----------------|-------------------|
| **İnternet** | Gerekli | Gerekmez |
| **Gizlilik** | Düşük | Yüksek |
| **Hız** | Hızlı | Orta |
| **Doğruluk** | İyi | Çok İyi |
| **Dil Desteği** | Sınırlı | 99+ dil |
| **Offline** | ❌ | ✅ |
| **Electron** | ⚠️ Network Error | ✅ Çalışır |

## Gelecek İyileştirmeler

1. **Model Seçimi**: Kullanıcı model seçebilsin
2. **Dil Algılama**: Otomatik dil algılama
3. **Streaming**: Gerçek zamanlı streaming
4. **GPU Desteği**: CUDA/Metal desteği
5. **Model Cache**: Daha hızlı yükleme

## Referanslar

- [Whisper Model](https://github.com/openai/whisper)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [ONNX Runtime](https://onnxruntime.ai/)
- [Xenova/whisper-tiny](https://huggingface.co/Xenova/whisper-tiny)

## İlgili Dosyalar

- `hooks/useVoiceRecognitionUnified.ts` - Unified hook
- `hooks/useVoiceRecognition.ts` - Electron implementation
- `electron/speechRecognition.cjs` - IPC handlers
- `electron/speechWorker.cjs` - Worker thread
- `docs/ELECTRON_VOICE_RECOGNITION.md` - Bu dokümantasyon
