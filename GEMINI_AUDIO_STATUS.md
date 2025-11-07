# Gemini Audio Transcription Durumu

## Durum: ❌ Çalışmıyor (HTTP 400)

Gemini 2.0 Flash'ın audio transcription özelliği teoride destekleniyor ama pratikte çalışmıyor.

## Denenen Çözümler

### 1. Model Değişiklikleri
- ❌ `gemini-2.0-flash-exp` → HTTP 400
- ❌ `gemini-1.5-flash-latest` → HTTP 400

### 2. Format Değişiklikleri
- ❌ `audio/webm` → HTTP 400
- ❌ `audio/wav` → HTTP 400

### 3. API Endpoint
- ✅ URL doğru: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- ✅ API key geçerli (chat için çalışıyor)
- ❌ Audio request → HTTP 400

## Olası Nedenler

### 1. SDK Versiyonu
```json
"@google/genai": "1.27.0"
```
Bu SDK versiyonu audio desteği içermiyor olabilir. Daha yeni bir versiyon gerekebilir.

### 2. Audio Format
Float32Array → base64 dönüşümü sorunlu olabilir. Gemini belki farklı bir encoding bekliyor.

### 3. API Endpoint
Belki audio için farklı bir endpoint kullanılması gerekiyor:
- Multimodal Live API
- Streaming API
- Farklı bir v1/v1beta endpoint

### 4. Feature Flag
Gemini 2.0 Flash audio desteği henüz public API'de aktif olmayabilir.

## Mevcut Çözüm: Whisper

Gemini audio çalışmadığı için **Whisper varsayılan olarak kullanılıyor**:

```typescript
// hooks/useWhisperVoice.ts
const useGemini = options.useGemini ?? false; // Disabled
```

### Whisper Avantajları
✅ Stabil ve güvenilir
✅ Offline çalışıyor
✅ Python + base model (~1GB)
✅ Türkçe desteği mükemmel
✅ Timeout/buffer sorunları çözüldü

### Whisper Dezavantajları
❌ Sadece Electron'da çalışıyor
❌ Python dependency
❌ Model indirme gerekiyor
❌ 2-5 saniye transcription süresi

## Gelecek İyileştirmeler

### Kısa Vadede
- [ ] SDK versiyonunu güncelle
- [ ] Gemini audio format dokümantasyonunu kontrol et
- [ ] Multimodal Live API'yi araştır

### Uzun Vadede
- [ ] Gemini audio stable olduğunda tekrar dene
- [ ] Kullanıcıya servis seçimi sun (Settings)
- [ ] Hybrid yaklaşım: Whisper (offline) + Gemini (online)

## Sonuç

**Şu an için Whisper kullanılıyor ve iyi çalışıyor.** Gemini audio desteği gelecekte eklenebilir ama şu an öncelik değil.

## Test Komutları

Gemini audio'yu manuel test etmek için:

```typescript
// FormattingToolbar.tsx
useGemini: true // Zorla aktif et
```

Sonra console'da HTTP 400 hatası ve detayları göreceksiniz.
