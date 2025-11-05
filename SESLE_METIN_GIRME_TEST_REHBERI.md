# 🧪 SESLE METİN GİRME TEST REHBERİ

## 📋 TEST SENARYOLARI

### 1. Temel Fonksiyon Testleri

#### Test 1.1: Normal Ses Tanıma
**Adımlar:**
1. Uygulamayı başlat
2. Editörde mikrofon butonuna tıkla
3. "Merhaba, bu bir test" de
4. Kayıt durdur butonuna bas

**Beklenen Sonuç:**
- Ses tanıma modal açılır
- Yeşil nokta (model hazır) görünür
- Metin doğru şekilde tanınır
- Editöre metin eklenir

#### Test 1.2: Model Ön Yükleme
**Adımlar:**
1. Uygulamayı başlat
2. Mikrofon butonunu gözlemle
3. 2-3 saniye bekle

**Beklenen Sonuç:**
- Başlangıçta sarı nokta (yükleniyor)
- 2-10 saniye sonra yeşil nokta (hazır)
- Console'da "Whisper model başarıyla ön yüklendi" mesajı

### 2. Hata Durumu Testleri

#### Test 2.1: İnternet Bağlantısı Kesilmesi
**Adımlar:**
1. İnternet bağlantısını kes
2. Ses tanımayı başlat
3. Konuş ve kayıt durdur

**Beklenen Sonuç:**
- "İnternet bağlantısı gerekli. Offline ses tanıma aktif." uyarısı
- Whisper modeline otomatik geçiş
- Offline ses tanıma çalışır

#### Test 2.2: Mikrofon İzni Reddi
**Adımlar:**
1. Tarayıcı ayarlarından mikrofon iznini reddet
2. Ses tanımayı başlat

**Beklenen Sonuç:**
- "Mikrofon izni gerekli" hata mesajı
- Kullanıcıya açık yönlendirme

#### Test 2.3: Uzun Süre Kayıt
**Adımlar:**
1. Ses tanımayı başlat
2. 2-3 dakika sürekli konuş
3. Bellek kullanımını izle

**Beklenen Sonuç:**
- Bellek sızıntısı olmamalı
- Ses kalitesi düşmemeli
- Sistem donmamalı

### 3. Tarayıcı Uyumluluğu Testleri

#### Test 3.1: Chrome/Chromium
- Web Speech API çalışmalı
- Whisper fallback çalışmalı

#### Test 3.2: Firefox
- Web Speech API sınırlı
- Whisper ana motor olmalı

#### Test 3.3: Edge
- Web Speech API çalışmalı
- Hibrit sistem aktif olmalı

### 4. Performans Testleri

#### Test 4.1: İlk Yanıt Süresi
**Hedef:** < 2 saniye
**Ölçüm:** Mikrofon butonuna tıklamadan ses tanıma başlayana kadar

#### Test 4.2: Transkripsiyon Doğruluğu
**Hedef:** > %85
**Test Metni:** "Merhaba, bugün hava çok güzel. Türkçe ses tanıma testi yapıyorum."

#### Test 4.3: Bellek Kullanımı
**Hedef:** < 100MB ek bellek
**Ölçüm:** 10 dakika sürekli kullanım sonrası

## 🔧 HATA AYIKLAMA ARAÇLARI

### Console Komutları
```javascript
// Model durumunu kontrol et
await window.electron.speech.isInitialized()

// Manuel model yükleme
await window.electron.speech.initialize()

// Ses tanıma test
await window.electron.speech.transcribe({audioData: new Float32Array(1000)})
```

### Log İzleme
```javascript
// Detaylı log için
localStorage.setItem('voice-debug', 'true')

// ONNX loglarını göster
process.env.ONNXRUNTIME_LOG_SEVERITY_LEVEL = '0'
```

## 📊 TEST SONUÇLARI ŞABLONU

### Test Raporu: [Tarih]

**Ortam:**
- OS: Windows/Mac/Linux
- Tarayıcı: Chrome/Firefox/Edge [Versiyon]
- Electron: [Versiyon]

**Sonuçlar:**

| Test | Durum | Süre | Notlar |
|------|-------|------|--------|
| Normal Ses Tanıma | ✅/❌ | Xs | |
| Model Ön Yükleme | ✅/❌ | Xs | |
| İnternet Kesintisi | ✅/❌ | Xs | |
| Mikrofon İzni | ✅/❌ | Xs | |
| Uzun Kayıt | ✅/❌ | Xs | |

**Genel Değerlendirme:**
- Başarı Oranı: X%
- Kritik Hatalar: X
- Performans: İyi/Orta/Kötü

## 🚀 OTOMATIK TEST KURULUMU

### Jest Test Dosyası
```typescript
// tests/voice-recognition.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react';
import FormattingToolbar from '../components/FormattingToolbar';

describe('Voice Recognition', () => {
  beforeEach(() => {
    // Mock electron API
    (window as any).electron = {
      speech: {
        initialize: jest.fn().mockResolvedValue({ success: true }),
        isInitialized: jest.fn().mockResolvedValue(true),
        transcribe: jest.fn().mockResolvedValue({ 
          success: true, 
          text: 'test transcript' 
        })
      }
    };
  });

  test('should show model loading indicator', async () => {
    const { getByTitle } = render(<FormattingToolbar />);
    const micButton = getByTitle(/voice/i);
    
    expect(micButton).toHaveClass('opacity-75');
    
    await waitFor(() => {
      expect(micButton).not.toHaveClass('opacity-75');
    });
  });

  test('should handle network errors gracefully', async () => {
    // Mock network error
    const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      onerror: null,
      onresult: null
    }));
    
    (window as any).SpeechRecognition = mockSpeechRecognition;
    
    // Test implementation
  });
});
```

### Cypress E2E Test
```typescript
// cypress/e2e/voice-recognition.cy.ts
describe('Voice Recognition E2E', () => {
  it('should complete full voice input flow', () => {
    cy.visit('/');
    cy.get('[data-testid="mic-button"]').click();
    cy.get('[data-testid="voice-modal"]').should('be.visible');
    cy.get('[data-testid="record-button"]').click();
    
    // Simulate voice input
    cy.window().then((win) => {
      // Mock speech recognition result
      win.dispatchEvent(new CustomEvent('speechresult', {
        detail: { transcript: 'Test voice input' }
      }));
    });
    
    cy.get('[data-testid="submit-button"]').click();
    cy.get('.editor-content').should('contain', 'Test voice input');
  });
});
```

## 📈 PERFORMANS İZLEME

### Metrikler
```typescript
// Performance monitoring
const performanceMonitor = {
  startTime: 0,
  
  startRecording() {
    this.startTime = performance.now();
    console.log('🎤 Recording started');
  },
  
  endRecording() {
    const duration = performance.now() - this.startTime;
    console.log(`🎤 Recording ended: ${duration}ms`);
    
    // Send to analytics
    if (duration > 5000) {
      console.warn('⚠️ Slow recording detected');
    }
  }
};
```

---

**Test Rehberi Versiyonu:** 1.0  
**Son Güncelleme:** 5 Kasım 2025  
**Hazırlayan:** Kiro AI Assistant