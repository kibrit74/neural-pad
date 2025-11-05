# Voice Recognition Strategy - Web Speech API First

## Problem

Electron'da offline Whisper modeli kullanmak:
- ❌ Çok yavaş (2-5 saniye transkripsiyon)
- ❌ Yüksek bellek kullanımı (~300 MB)
- ❌ İlk yükleme uzun sürer
- ❌ Kullanıcı deneyimi kötü

## Çözüm

**Web Speech API'yi önceliklendir, Whisper'ı sadece fallback olarak kullan**

### Yeni Strateji

```
1. Web Speech API (Öncelik)
   ⚡ Hızlı (gerçek zamanlı)
   ⚡ Düşük bellek kullanımı
   ⚡ Yüksek doğruluk
   ⚠️ İnternet gerektirir

2. Whisper Fallback (Sadece hata durumunda)
   🐌 Yavaş (2-5 saniye)
   💾 Yüksek bellek (~300 MB)
   ✅ Offline çalışır
   ✅ Gizlilik
```

## Implementasyon

### 1. CSP Ayarları (electron/main.cjs)

Google Speech API için izinler eklendi:

```javascript
'Content-Security-Policy': [
  "connect-src 'self' app: https://*.googleapis.com https://*.google.com wss://*.google.com",
  "media-src 'self' blob: data:"
]
```

### 2. Unified Hook (hooks/useVoiceRecognitionUnified.ts)

```typescript
export const useVoiceRecognitionUnified = (options) => {
  const [useWhisperFallback, setUseWhisperFallback] = useState(false);
  
  // Wrap error handler
  const wrappedOptions = {
    ...options,
    onError: (error) => {
      // Switch to Whisper only if Web Speech fails
      if (error === 'network' || error === 'service-not-allowed') {
        setUseWhisperFallback(true);
      }
      options.onError?.(error);
    }
  };
  
  // Try Web Speech API first
  const webSpeechResult = useVoiceRecognition(wrappedOptions);
  const electronResult = useElectronVoiceRecognition(options);
  
  // Use Whisper only as fallback
  return useWhisperFallback ? electronResult : webSpeechResult;
};
```

## Kullanıcı Deneyimi

### Web Speech API (Normal Durum)

```
Kullanıcı: [Mikrofon butonuna tıklar]
Sistem: [Anında başlar]
Kullanıcı: "Merhaba bu bir test"
Sistem: [Gerçek zamanlı metin görünür]
Kullanıcı: "Tamam"
Sistem: [Anında kaydedilir]

Toplam Süre: ~1 saniye
```

### Whisper Fallback (Hata Durumu)

```
Kullanıcı: [Mikrofon butonuna tıklar]
Sistem: [Web Speech API network hatası]
Sistem: [Whisper'a geçiş yapılıyor...]
Kullanıcı: "Merhaba bu bir test"
Sistem: [Kayıt devam ediyor...]
Kullanıcı: [Durdur butonuna tıklar]
Sistem: [2-5 saniye işleniyor...]
Sistem: [Metin görünür]

Toplam Süre: ~5-10 saniye
```

## Avantajlar

### Web Speech API Öncelikli

✅ **Hız**: Gerçek zamanlı transkripsiyon
✅ **Bellek**: Düşük kullanım (~50 MB)
✅ **Doğruluk**: Google'ın AI modelleri
✅ **Kullanıcı Deneyimi**: Anında yanıt
✅ **Çoklu Dil**: 100+ dil desteği

### Whisper Fallback

✅ **Güvenilirlik**: Her zaman çalışır
✅ **Offline**: İnternet gerekmez
✅ **Gizlilik**: Veriler cihazda kalır
✅ **Yedek**: Network hatalarında devreye girer

## Performans Karşılaştırması

| Metrik | Web Speech API | Whisper |
|--------|----------------|---------|
| **Başlatma** | < 100ms | 2-5 saniye |
| **Transkripsiyon** | Gerçek zamanlı | 2-5 saniye |
| **Bellek** | ~50 MB | ~300 MB |
| **CPU** | Düşük | Yüksek |
| **Doğruluk** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Kullanıcı Memnuniyeti** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## Test Senaryoları

### Senaryo 1: Normal Kullanım (İnternet Var)

```
✅ Web Speech API kullanılır
✅ Hızlı ve akıcı deneyim
✅ Gerçek zamanlı metin
```

### Senaryo 2: Network Hatası

```
⚠️ Web Speech API başarısız
🔄 Whisper fallback devreye girer
✅ Yavaş ama çalışır
```

### Senaryo 3: Offline Kullanım

```
❌ Web Speech API çalışmaz
🔄 Whisper fallback devreye girer
✅ Offline çalışır
```

## Console Log'ları

### Normal Durum (Web Speech API)

```
[VoiceRecognitionUnified] ⚡ Using Web Speech API (fast)
Speech recognition started
Interim result: "merhaba"
Final result: "merhaba bu bir test"
```

### Fallback Durumu (Whisper)

```
[VoiceRecognitionUnified] ⚡ Using Web Speech API (fast)
Speech recognition error: network
[VoiceRecognitionUnified] Web Speech API failed, switching to Whisper fallback
[VoiceRecognitionUnified] 🐌 Using Electron Whisper (offline fallback - slow)
[Electron SR] Starting recording...
[Electron SR] Processing audio...
Transcription result: "merhaba bu bir test"
```

## Sorun Giderme

### Web Speech API Çalışmıyor

1. **İnternet bağlantısını kontrol edin**
2. **CSP ayarlarını kontrol edin** (electron/main.cjs)
3. **Console log'larını kontrol edin**
4. **Otomatik olarak Whisper'a geçecek**

### Whisper Çok Yavaş

1. **Normal durum** - Web Speech API kullanılmalı
2. **Fallback durumu** - Yavaşlık beklenir
3. **İnternet bağlantısını düzeltin** - Web Speech'e geri dönecek

### Her İkisi de Çalışmıyor

1. **Mikrofon izinlerini kontrol edin**
2. **DevTools console'u kontrol edin**
3. **Uygulamayı yeniden başlatın**

## Gelecek İyileştirmeler

1. **Kullanıcı Tercihi**: Manuel olarak Whisper seçme
2. **Otomatik Algılama**: İnternet hızına göre seçim
3. **Hybrid Mode**: Kısa metinler için Web Speech, uzun metinler için Whisper
4. **Model Optimizasyonu**: Daha hızlı Whisper modeli

## Referanslar

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Whisper Model](https://github.com/openai/whisper)
- [Electron CSP](https://www.electronjs.org/docs/latest/tutorial/security)

## İlgili Dosyalar

- `hooks/useVoiceRecognitionUnified.ts` - Strateji implementasyonu
- `electron/main.cjs` - CSP ayarları
- `docs/VOICE_RECOGNITION_STRATEGY.md` - Bu dokümantasyon
