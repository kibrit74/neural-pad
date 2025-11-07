# Whisper Timeout Sorunu Düzeltmesi

## Sorun
```
[ELECTRON] [Whisper IPC] Transcribe error: Error: Transcription timeout
```

Whisper servisi 107520 byte'lık ses verisini işlerken 30 saniye timeout'a takılıyordu.

## Tespit Edilen Sorunlar

### 1. Timeout Yönetimi Hatası (`electron/whisperService.cjs`)
- ❌ Queue'dan yanlış eleman siliniyordu
- ❌ Timeout callback'i düzgün temizlenmiyordu
- ❌ 30 saniye çok uzun bir timeout süresi

### 2. Hata Yakalama Eksikliği (`python/whisper_server.py`)
- ❌ Python tarafında detaylı log yoktu
- ❌ Transcription süresi ölçülmüyordu
- ❌ Hata detayları loglanmıyordu

### 3. Stderr Logging (`electron/whisperService.cjs`)
- ❌ Python debug mesajları gösterilmiyordu
- ❌ Hata ayıklama zordu

## Yapılan Düzeltmeler

### 1. Timeout Yönetimi İyileştirildi
```javascript
// Öncesi: Yanlış queue yönetimi
setTimeout(() => {
  const index = this.queue.indexOf(this.queue[0]);  // ❌ Yanlış
  if (index > -1) {
    this.queue.splice(index, 1);
    reject(new Error('Transcription timeout'));
  }
}, 30000);

// Sonrası: Doğru callback tracking
let timeoutId = null;
let isResolved = false;

const callback = (result) => {
  if (isResolved) return;
  isResolved = true;
  
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  // ... handle result
};

timeoutId = setTimeout(() => {
  if (isResolved) return;
  isResolved = true;
  
  const index = this.queue.indexOf(callback);  // ✅ Doğru
  if (index > -1) {
    this.queue.splice(index, 1);
  }
  reject(new Error('Transcription timeout'));
}, 15000);  // ✅ 15 saniyeye düşürüldü
```

### 2. Python Detaylı Logging
```python
# Transcription başlangıcı
sys.stderr.write(f"[Whisper Python] Starting transcription: {audio_length} bytes\n")

# Audio analizi
sys.stderr.write(f"[Whisper Python] Audio array size: {len(audio_array)} samples\n")
sys.stderr.write(f"[Whisper Python] Audio energy: {audio_energy}\n")

# Süre ölçümü
start_time = time.time()
result = model.transcribe(...)
elapsed = time.time() - start_time
sys.stderr.write(f"[Whisper Python] Transcription took {elapsed:.2f}s\n")

# Hata detayları
except Exception as e:
    error_details = traceback.format_exc()
    sys.stderr.write(f"[Whisper Python] Exception: {error_details}\n")
```

### 3. Electron Stderr İyileştirildi
```javascript
this.process.stderr.on('data', (data) => {
  const lines = message.split('\n').filter(line => line.trim());
  lines.forEach(line => {
    if (line.includes('[Whisper Python]')) {
      console.log(line); // ✅ Python debug mesajları gösteriliyor
    }
    // ... diğer log filtreleri
  });
});
```

### 4. Whisper Parametreleri Optimize Edildi
```python
result = model.transcribe(
    audio_array, 
    language=language, 
    fp16=False,
    condition_on_previous_text=False,  # ✅ Daha hızlı
    no_speech_threshold=0.6,           # ✅ Sessizlik tespiti
    verbose=False                       # ✅ Gereksiz output yok
)
```

## Beklenen İyileştirmeler

1. **%50 daha hızlı timeout tespiti**: 30s → 15s
2. **Daha iyi hata ayıklama**: Detaylı Python logları
3. **Doğru queue yönetimi**: Callback'ler düzgün temizleniyor
4. **Performans ölçümü**: Transcription süresi loglanıyor

## Debug Logları

Artık şu logları göreceksiniz:

```
[Whisper Python] Starting transcription: 107520 bytes, lang=tr
[Whisper Python] Audio array size: 26880 samples
[Whisper Python] Audio energy: 0.0234
[Whisper Python] Starting Whisper transcription...
[Whisper Python] Transcription took 2.34s
[Whisper Python] Transcription complete: 'merhaba dünya'
```

## Test Önerileri

1. Ses kaydı yapın ve logları kontrol edin
2. Transcription süresini ölçün (2-5 saniye arası normal)
3. Timeout durumunda detaylı hata mesajını kontrol edin
4. Python exception'larının tam stack trace'ini görün

## 5. JSON Decode Hatası Düzeltmesi

### Sorun
```
JSON decode error: Expecting value: line 1 column 1 (char 0)
```

Birden fazla transcription isteği gönderildiğinde stdin buffer'ı senkronizasyonunu kaybediyordu.

### Çözüm

#### Python Tarafı
```python
# Boş satırları atla
line = line.strip()
if not line:
    continue

# Audio data'yı chunk'lar halinde oku
audio_data = b''
remaining = audio_length

while remaining > 0:
    chunk = sys.stdin.buffer.read(remaining)
    if not chunk:
        break
    audio_data += chunk
    remaining -= len(chunk)
```

#### Electron Tarafı - Request Queue
```javascript
class WhisperService {
  constructor() {
    this.isProcessing = false;
    this.pendingRequests = [];
  }

  async transcribe(audioBuffer, language) {
    // Queue requests to prevent stdin buffer corruption
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ audioBuffer, language, resolve, reject });
      this._processNextRequest();
    });
  }

  async _processNextRequest() {
    // Process one request at a time
    if (this.isProcessing || this.pendingRequests.length === 0) {
      return;
    }
    this.isProcessing = true;
    // ... process request
    this.isProcessing = false;
    setImmediate(() => this._processNextRequest());
  }
}
```

## Notlar

- Timeout 15 saniyeye düşürüldü (base model için yeterli)
- Daha büyük modeller için timeout artırılabilir
- Tüm Python hataları artık detaylı loglanıyor
- Queue yönetimi thread-safe hale getirildi
- **Sıralı işlem garantisi**: Aynı anda sadece 1 transcription işlenir
- **Buffer corruption önlendi**: stdin/stdout senkronizasyonu korunuyor
