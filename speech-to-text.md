# Speech-to-Text Özelliği - Detaylı Tasarım Dokümanı

## Genel Bakış

EchoDay uygulamasının Günlük Notlarım bölümünde kullanılan speech-to-text özelliği, **tamamen tarayıcı tabanlı Web Speech API** kullanılarak geliştirilmiştir. Herhangi bir harici kütüphane veya servis kullanılmamaktadır.

## Mimari

### Katmanlar

```
┌─────────────────────────────────────────┐
│   DailyNotepad Component (UI Layer)     │
│   - Mikrofon butonu                      │
│   - Not girişi alanı                     │
│   - Görsel geri bildirim                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Speech Recognition Logic (Inline)     │
│   - Web Speech API entegrasyonu          │
│   - Sesli komut işleme                   │
│   - Dil yönetimi                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Web Speech API (Browser Native)       │
│   - SpeechRecognition                    │
│   - Mikrofon erişimi                     │
│   - Konuşma tanıma motoru                │
└─────────────────────────────────────────┘
```

### Bileşenler ve Arayüzler

#### 1. DailyNotepad Component

**Konum:** `src/components/DailyNotepad.tsx`

**Sorumluluklar:**
- Kullanıcı arayüzü yönetimi
- Konuşma tanıma durumu kontrolü
- Sesli komut işleme
- Not kaydetme

**Önemli State'ler:**
```typescript
const [isListening, setIsListening] = useState(false);
const [hasSupport, setHasSupport] = useState(false);
const recognitionRef = useRef<any>(null);
```

#### 2. Web Speech API Entegrasyonu

**Kullanılan API:**
```typescript
const SpeechRecognition = 
  (window as any).SpeechRecognition || 
  (window as any).webkitSpeechRecognition;
```

**Yapılandırma:**
```typescript
recognition.continuous = true;      // Sürekli dinleme
recognition.interimResults = true;  // Ara sonuçları göster
recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
```

## Veri Modelleri

### Konuşma Tanıma Sonucu

```typescript
interface SpeechRecognitionResult {
  transcript: string;      // Tanınan metin
  isFinal: boolean;       // Kesin sonuç mu?
  confidence: number;     // Güven skoru (0-1)
}
```

### Sesli Komutlar

```typescript
interface VoiceCommands {
  tr: string[];  // Türkçe komutlar
  en: string[];  // İngilizce komutlar
}

const commands: VoiceCommands = {
  tr: ['tamam', 'bitti', 'kaydet', 'not ekle', 'ekle', 'tamam kaydet', 'not olarak kaydet'],
  en: ['okay', 'done', 'save', 'add note', 'save note', 'okay save', 'that\'s it']
};
```

## Detaylı İşleyiş

### 1. Başlatma (Initialization)

```typescript
useEffect(() => {
  // Tarayıcı desteğini kontrol et
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;
  
  setHasSupport(!!SpeechRecognition);
}, []);
```

**Desteklenen Tarayıcılar:**
- Chrome/Chromium (tam destek)
- Edge (tam destek)
- Safari 14.1+ (kısmi destek)
- Firefox (destek yok)

### 2. Konuşma Tanımayı Başlatma

```typescript
const startListening = useCallback(() => {
  if (!hasSupport || isListening) return;
  
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) return;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
  
  // Event handler'ları ayarla
  recognition.onresult = handleResult;
  recognition.onerror = handleError;
  recognition.onend = handleEnd;
  
  recognitionRef.current = recognition;
  recognition.start();
  setIsListening(true);
}, [hasSupport, isListening, lang]);
```

### 3. Konuşma Sonuçlarını İşleme

```typescript
recognition.onresult = (event: any) => {
  // Tüm sonuçları birleştir
  const transcript = Array.from(event.results)
    .map((result: any) => result[0])
    .map((result: any) => result.transcript)
    .join('');
  
  // Metni güncelle
  setNewNoteText(transcript);
  
  // Kesin sonuç mu kontrol et
  const isFinal = event.results[event.results.length - 1]?.isFinal;
  
  if (isFinal) {
    handleTranscript(transcript);
  }
};
```

### 4. Sesli Komut Algılama

```typescript
const handleTranscript = useCallback((finalTranscript: string) => {
  const transcript = finalTranscript.toLowerCase();
  
  // Aktif dile göre komutları al
  const commands = {
    tr: ['tamam', 'bitti', 'kaydet', 'not ekle', 'ekle'],
    en: ['okay', 'done', 'save', 'add note', 'save note']
  };
  
  const currentCommands = commands[lang as 'tr' | 'en'] || commands.en;
  
  // Komut var mı kontrol et
  const hasCommand = currentCommands.some(cmd => {
    const words = transcript.split(' ');
    const lastWords = words.slice(-cmd.split(' ').length).join(' ');
    return lastWords === cmd || transcript.endsWith(cmd);
  });
  
  if (hasCommand) {
    // Komutu metnin sonundan çıkar
    let noteText = finalTranscript;
    for (const cmd of currentCommands) {
      const regex = new RegExp(`\\b${cmd}\\s*$`, 'gi');
      noteText = noteText.replace(regex, '').trim();
    }
    
    // Notu kaydet
    if (noteText.trim() || newNoteImageDataUrl) {
      handleAddNote(noteText);
      setNewNoteText('');
      
      if (setNotification) {
        setNotification({ 
          message: lang === 'tr' 
            ? 'Not sesli komutla kaydedildi!' 
            : 'Note saved with voice command!', 
          type: 'success' 
        });
      }
    }
  } else {
    // Komut yoksa sadece metni güncelle
    setNewNoteText(finalTranscript);
  }
}, [lang, newNoteImageDataUrl, handleAddNote, setNotification]);
```

### 5. Hata Yönetimi

```typescript
recognition.onerror = (event: any) => {
  console.error('Speech recognition error:', event.error);
  setIsListening(false);
  
  if (setNotification) {
    setNotification({
      message: 'Ses tanıma hatası: ' + event.error,
      type: 'error'
    });
  }
};
```

**Yaygın Hatalar:**
- `no-speech`: Konuşma algılanmadı
- `audio-capture`: Mikrofon erişim hatası
- `not-allowed`: İzin verilmedi
- `network`: Ağ hatası
- `aborted`: İşlem iptal edildi

### 6. Konuşma Tanımayı Durdurma

```typescript
const stopListening = useCallback(() => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }
  setIsListening(false);
}, []);
```

## Kullanıcı Arayüzü

### Mikrofon Butonu

```tsx
{hasSupport && (
  <button 
    type="button" 
    onClick={isListening ? stopListening : startListening} 
    className={`p-1.5 rounded-full transition-all ${
      isListening 
        ? 'bg-red-500/20 text-red-500 animate-pulse' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-500'
    }`}
    aria-label={isListening ? 'Dinlemeyi Durdur' : 'Sesli Not Ekle'}
  >
    <svg><!-- Mikrofon ikonu --></svg>
  </button>
)}
```

**Görsel Durumlar:**
1. **Pasif:** Gri renk, hover efekti
2. **Aktif:** Kırmızı renk, pulse animasyonu
3. **Gizli:** Tarayıcı desteklemiyorsa gösterilmez

### Not Girişi Alanı

```tsx
<textarea
  value={newNoteText}
  onChange={(e) => setNewNoteText(e.target.value)}
  placeholder="Add a new note or paste an image..."
  className="w-full p-3 sm:p-4 pb-12 bg-transparent"
  rows={4}
/>
```

**Özellikler:**
- Gerçek zamanlı metin güncelleme
- Manuel düzenleme desteği
- Resim yapıştırma desteği

## Electron Entegrasyonu

### Electron'da Speech-to-Text Mimarisi

Electron uygulamasında iki farklı speech-to-text yaklaşımı kullanılmaktadır:

1. **Web Speech API** (Tarayıcı tabanlı - Basit kullanım için)
2. **MediaRecorder + Gemini API** (Electron özel - Gelişmiş özellikler için)

### 1. Web Speech API Entegrasyonu (Basit Yaklaşım)

Electron, Chromium tabanlı olduğu için Web Speech API'yi tam olarak destekler:

```javascript
// electron/main.cjs
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Web Speech API için gerekli
      enableRemoteModule: false
    }
  });
}
```

### 2. MediaRecorder + Gemini API Entegrasyonu (Gelişmiş Yaklaşım)

**Konum:** `src/hooks/useElectronSpeechRecognition.ts`

Bu yaklaşım, Electron'da daha gelişmiş kontrol ve özelleştirme sağlar:

#### Temel Yapı

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export const useElectronSpeechRecognition = (
  onTranscriptReady: (transcript: string) => void,
  options?: { 
    continuous?: boolean; 
    stopOnKeywords?: string[] | boolean;
    realTimeMode?: boolean;
    onUserSpeaking?: (isSpeaking: boolean) => void;
  }
) => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSupport, setHasSupport] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStopTimerRef = useRef<number | null>(null);
  const webSpeechRecognitionRef = useRef<any>(null);
  const isElectronRef = useRef<boolean>(false);
  
  // ... (devamı aşağıda)
};
```

#### Destek Kontrolü

```typescript
useEffect(() => {
  const isElectron = !!(window as any).isElectron || !!(window as any).electronAPI;
  isElectronRef.current = isElectron;
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
  const hasGetUserMedia = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
  const hasWebSpeechAPI = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  // Hem Electron (MediaRecorder + Gemini) hem de tarayıcı (Web Speech API) desteği
  setHasSupport((isElectron && hasMediaRecorder && hasGetUserMedia) || (!isElectron && hasWebSpeechAPI));
}, []);
```

#### Ses Kaydı Başlatma

```typescript
const startListening = useCallback(async () => {
  if (!hasSupport || isListening) return;
  
  try {
    // Tarayıcı için Web Speech API kullan
    if (!isElectronRef.current && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      webSpeechRecognitionRef.current = recognition;
      
      recognition.continuous = options?.continuous || true;
      recognition.interimResults = true;
      recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
      
      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        
        // Stop keyword kontrolü
        if (finalTranscript) {
          const stopKeywordsArray = Array.isArray(options?.stopOnKeywords) 
            ? options.stopOnKeywords 
            : (options?.stopOnKeywords !== false 
              ? (lang === 'tr' 
                  ? ['tamam', 'bitti', 'bıttı', 'kaydet', 'kayıt', 'ok', 'oldu', 'tamamdır', 'bitirdim', 'bıtırdım']
                  : ['ok', 'done', 'finished', 'complete', 'save'])
              : undefined);
          
          const fullText = finalTranscript + interimTranscript;
          let shouldStop = false;
          
          if (stopKeywordsArray) {
            for (const keyword of stopKeywordsArray) {
              if (fullText.toLowerCase().includes(keyword.toLowerCase())) {
                shouldStop = true;
                break;
              }
            }
          }
          
          if (shouldStop) {
            recognition.stop();
          }
        }
      };
      
      recognition.onend = () => {
        const cleanedText = finalTranscript ? cleanStopKeywords(finalTranscript, 
          Array.isArray(options?.stopOnKeywords) 
            ? options.stopOnKeywords 
            : (options?.stopOnKeywords !== false 
              ? (lang === 'tr' 
                  ? ['tamam', 'bitti', 'bıttı', 'kaydet', 'kayıt', 'ok', 'oldu', 'tamamdır', 'bitirdim', 'bıtırdım']
                  : ['ok', 'done', 'finished', 'complete', 'save'])
              : undefined)
        ) : '';
        
        setTranscript(cleanedText);
        onTranscriptReady(cleanedText);
        setIsListening(false);
        webSpeechRecognitionRef.current = null;
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        webSpeechRecognitionRef.current = null;
      };
      
      recognition.start();
      setIsListening(true);
      return;
    }
    
    // Electron için MediaRecorder + Gemini API kullan
    const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    const stream = await gum({ audio: true });
    streamRef.current = stream;
    
    // MediaRecorder oluştur
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      // Ses blob'unu oluştur
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Base64'e dönüştür
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];
        
        try {
          // API anahtarını oku
          const userScopedKey = `gemini-api-key_${userId}`;
          let apiKey = '';
          
          // Electron IPC'den oku
          if ((window as any).electronAPI?.getSetting) {
            try {
              apiKey = await (window as any).electronAPI.getSetting(userScopedKey);
            } catch (e) {
              console.warn('[Electron SR] Failed to read from Electron settings:', e);
            }
          }
          
          // localStorage'dan fallback
          if (!apiKey) {
            let raw = localStorage.getItem(userScopedKey) || '';
            if (!raw) raw = localStorage.getItem('gemini-api-key') || '';
            apiKey = raw && raw.startsWith('"') && raw.endsWith('"') ? JSON.parse(raw) : raw;
          }
          
          if (!apiKey) {
            console.warn('❌ Gemini API anahtarı bulunamadı. Profil sayfasından ekleyin.');
            alert('⚠️ API anahtarı bulunamadı!\n\nLütfen Profil sayfasından Gemini API anahtarınızı ekleyin.');
            setTranscript('');
            onTranscriptReady('');
            return;
          }
          
          // Gemini API ile metne dönüştür
          const text = await geminiService.speechToText(apiKey, base64Data, 'audio/webm');
          
          if (text) {
            // Stop keyword'leri temizle
            const stopKeywordsArray = Array.isArray(options?.stopOnKeywords) 
              ? options.stopOnKeywords 
              : (options?.stopOnKeywords !== false 
                ? (lang === 'tr' 
                    ? ['tamam', 'bitti', 'bıttı', 'kaydet', 'kayıt', 'ok', 'oldu', 'tamamdır', 'bitirdim', 'bıtırdım']
                    : ['ok', 'done', 'finished', 'complete', 'save'])
                : undefined);
            
            const cleanedText = stopKeywordsArray 
              ? cleanStopKeywords(text, stopKeywordsArray)
              : text;
            
            onTranscriptReady(cleanedText);
            setTranscript('');
          } else {
            setTranscript('');
            onTranscriptReady('');
          }
        } catch (e: any) {
          if (e?.message === 'API_QUOTA_EXCEEDED') {
            console.warn('Gemini API günlük kullanım limiti aşıldı.');
            alert('⚠️ API kullanım limiti aşıldı. Lütfen manuel görev ekleme kullanın veya yarın tekrar deneyin.');
          } else {
            console.error('Speech-to-text işleminde hata:', e);
          }
          setTranscript('');
          onTranscriptReady('');
        }
      };
      
      // Temizlik
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsListening(false);
    };
    
    // Kaydı başlat
    mediaRecorder.start();
    setIsListening(true);
    
    // Güvenlik için 60 saniye sonra otomatik durdur
    autoStopTimerRef.current = window.setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('[Electron SR] Auto-stopping after 60 seconds for safety');
        mediaRecorderRef.current.stop();
      }
    }, 60000);
    
  } catch (error) {
    console.error('Failed to start recording:', error);
    setIsListening(false);
  }
}, [hasSupport, isListening, onTranscriptReady, options?.continuous, options?.stopOnKeywords, lang]);
```

#### Stop Keyword Temizleme

```typescript
const cleanStopKeywords = (text: string, keywords?: string[] | boolean): string => {
  if (!keywords || typeof keywords === 'boolean' || !Array.isArray(keywords) || keywords.length === 0) return text;

  let cleaned = text.trim();
  
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  
  // Uzun keyword'leri önce kontrol et
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  const normalizedText = cleaned.toLocaleLowerCase('tr-TR');

  for (const keyword of sortedKeywords) {
    const normalizedKeyword = keyword.toLocaleLowerCase('tr-TR');
    const re = new RegExp(`(?:\\s*)${escapeRegex(normalizedKeyword)}(?:[\\s.,!?:;]*)<file name=".kiro/specs/speech-to-text-analysis/design.md" language="markdown" >
<content>
);
    const match = normalizedText.match(re);
    if (match && match.index !== undefined) {
      cleaned = text.substring(0, match.index).trim();
      break;
    }
  }

  return cleaned;
};
```

#### Kaydı Durdurma

```typescript
const stopListening = useCallback(() => {
  // Timer'ları temizle
  if (autoStopTimerRef.current) {
    clearTimeout(autoStopTimerRef.current);
    autoStopTimerRef.current = null;
  }
  
  // Web Speech Recognition'ı durdur
  if (webSpeechRecognitionRef.current) {
    try {
      webSpeechRecognitionRef.current.stop();
      webSpeechRecognitionRef.current = null;
    } catch (e) {
      // Hataları yoksay
    }
  }
  
  // Media stream'i temizle
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }
  
  // MediaRecorder'ı durdur
  if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
    mediaRecorderRef.current.stop();
  }
  
  setIsListening(false);
}, []);
```

#### Hook Return Değerleri

```typescript
return {
  isListening,
  transcript,
  startListening,
  stopListening,
  hasSupport,
  checkAndRequestPermission: async () => {
    try {
      // Web Speech API için izin kontrolü gerekmez
      if (!isElectronRef.current && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        return true;
      }
      
      // Electron için mikrofon erişimi kontrol et
      const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      await gum({ audio: true });
      return true;
    } catch {
      return false;
    }
  }
};
```

### Gemini API Entegrasyonu

**Konum:** `src/services/geminiService.ts`

```typescript
class GeminiService {
  async speechToText(apiKey: string, audioBase64: string, mimeType: string): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "Lütfen bu ses kaydındaki konuşmayı metne dönüştür. Sadece konuşulan metni ver, başka açıklama ekleme."
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: audioBase64
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429 || errorData?.error?.message?.includes('quota')) {
          throw new Error('API_QUOTA_EXCEEDED');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return text.trim();
    } catch (error) {
      console.error('Gemini STT Error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
```

### DailyNotepad'de Kullanım

**Konum:** `src/components/DailyNotepad.tsx`

```typescript
// Basit Web Speech API kullanımı (inline)
const [isListening, setIsListening] = useState(false);
const [hasSupport, setHasSupport] = useState(false);
const recognitionRef = useRef<any>(null);

useEffect(() => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  setHasSupport(!!SpeechRecognition);
}, []);

const handleTranscript = useCallback((finalTranscript: string) => {
  const transcript = finalTranscript.toLowerCase();
  const commands = {
    tr: ['tamam', 'bitti', 'kaydet', 'not ekle', 'ekle', 'tamam kaydet', 'not olarak kaydet'],
    en: ['okay', 'done', 'save', 'add note', 'save note', 'okay save', 'that\'s it']
  };
  
  const currentCommands = commands[lang as 'tr' | 'en'] || commands.en;
  const hasCommand = currentCommands.some(cmd => {
    const words = transcript.split(' ');
    const lastWords = words.slice(-cmd.split(' ').length).join(' ');
    return lastWords === cmd || transcript.endsWith(cmd);
  });
  
  if (hasCommand) {
    let noteText = finalTranscript;
    for (const cmd of currentCommands) {
      const regex = new RegExp(`\\b${cmd.replace(/'/g, "\\'").replace(/\\s+/g, '\\s+')}\\s*$`, 'gi');
      noteText = noteText.replace(regex, '').trim();
    }
    
    if (noteText.trim() || newNoteImageDataUrl) {
      handleAddNote(noteText);
      setTimeout(() => {
        setNewNoteText('');
      }, 0);
      if (setNotification) {
        setNotification({ 
          message: lang === 'tr' ? 'Not sesli komutla kaydedildi!' : 'Note saved with voice command!', 
          type: 'success' 
        });
      }
    }
  } else {
    setNewNoteText(finalTranscript);
  }
}, [lang, newNoteImageDataUrl, handleAddNote, setNotification]);

const startListening = useCallback(() => {
  if (!hasSupport || isListening) return;
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
  
  recognition.onresult = (event: any) => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0])
      .map((result: any) => result.transcript)
      .join('');
    
    setNewNoteText(transcript);
    
    const isFinal = event.results[event.results.length - 1]?.isFinal;
    if (isFinal) {
      handleTranscript(transcript);
    }
  };
  
  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    if (setNotification) {
      setNotification({
        message: 'Ses tanıma hatası: ' + event.error,
        type: 'error'
      });
    }
  };
  
  recognition.onend = () => {
    setIsListening(false);
  };
  
  recognitionRef.current = recognition;
  recognition.start();
  setIsListening(true);
}, [hasSupport, isListening, lang, handleTranscript, setNotification]);

const stopListening = useCallback(() => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }
  setIsListening(false);
}, []);
```

### Mikrofon İzinleri

Electron otomatik olarak işletim sistemi izin penceresini gösterir:

**Windows:**
- İlk kullanımda Windows mikrofon izni istenir
- Ayarlar > Gizlilik > Mikrofon'dan kontrol edilebilir

**macOS:**
- İlk kullanımda macOS mikrofon izni istenir
- Sistem Tercihleri > Güvenlik ve Gizlilik > Mikrofon'dan kontrol edilebilir

### Karşılaştırma: Web Speech API vs MediaRecorder + Gemini

| Özellik | Web Speech API | MediaRecorder + Gemini |
|---------|----------------|------------------------|
| **Gerçek Zamanlı** | ✅ Evet | ❌ Hayır (kayıt bitince) |
| **Offline Çalışma** | ❌ Hayır | ❌ Hayır |
| **API Anahtarı** | ❌ Gerekmez | ✅ Gerekli |
| **Maliyet** | 🆓 Ücretsiz | 💰 API kullanım ücreti |
| **Doğruluk** | ⭐⭐⭐ İyi | ⭐⭐⭐⭐ Çok İyi |
| **Dil Desteği** | 🌍 Sınırlı | 🌍 Geniş |
| **Özelleştirme** | ❌ Sınırlı | ✅ Esnek |
| **Tarayıcı Desteği** | Chrome, Edge, Safari | Tüm modern tarayıcılar |
| **Electron Desteği** | ✅ Tam | ✅ Tam |

### Ağ Hatası Workaround

```typescript
recognition.onerror = (event: any) => {
  if (event.error === 'network') {
    // Electron'da ağ hatası için yeniden başlatma
    if ((window as any).electronAPI) {
      setTimeout(() => {
        if (!isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.error('Failed to restart:', e);
          }
        }
      }, 1000);
    }
  }
};
```

### Capacitor Speech Recognition (Mobil Destek)

**Konum:** `src/hooks/useSpeechRecognitionUnified.ts`

Bu hook, Capacitor kullanarak mobil cihazlarda (iOS ve Android) native speech recognition desteği sağlar:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

interface SpeechRecognitionOptions {
  stopOnKeywords?: string[];
  continuous?: boolean;
  stopOnSilence?: boolean;
}

export const useSpeechRecognitionUnified = (
  onTranscriptReady: (transcript: string) => void,
  options?: SpeechRecognitionOptions
) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSupport, setHasSupport] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  
  const onTranscriptReadyRef = useRef(onTranscriptReady);
  const recognitionActiveRef = useRef(false);
  const listenersRef = useRef<any[]>([]);
  
  useEffect(() => {
    onTranscriptReadyRef.current = onTranscriptReady;
  }, [onTranscriptReady]);

  // Kullanılabilirlik kontrolü
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await SpeechRecognition.available();
        setHasSupport(true);
        setIsAvailable(result.available);
        console.log('[SpeechRecognition] Available:', result.available);
      } catch (error) {
        console.log('[SpeechRecognition] Not available on web platform:', (error as Error)?.message || 'Capacitor feature not implemented');
        setHasSupport(false);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  const startListening = useCallback(async () => {
    if (!hasSupport || !isAvailable || recognitionActiveRef.current) {
      console.log('[SpeechRecognition] Cannot start - not available or already active');
      return;
    }

    try {
      console.log('[SpeechRecognition] Starting...');
      
      // İzin iste
      const permissionResult = await SpeechRecognition.requestPermissions();
      if (permissionResult.speechRecognition !== 'granted') {
        console.error('[SpeechRecognition] Permission denied');
        return;
      }

      // Dinlemeyi başlat
      await SpeechRecognition.start({
        language: 'tr-TR',
        partialResults: options?.continuous ?? true,
        popup: false,
      });

      setIsListening(true);
      recognitionActiveRef.current = true;
      setTranscript('');
      
      console.log('[SpeechRecognition] Started successfully');

      // Ara sonuç listener'ı
      const partialResultsListener = await SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
        console.log('[SpeechRecognition] Partial results:', data);
        if (data.matches && data.matches.length > 0) {
          const text = data.matches[0];
          setTranscript(text);
        }
      });

      // Dinleme durumu listener'ı
      const listeningStateListener = await SpeechRecognition.addListener('listeningState', (data: { status: 'started' | 'stopped' }) => {
        console.log('[SpeechRecognition] State changed:', data.status);
        if (data.status === 'stopped') {
          // Dinleme durduğunda final transcript'i işle
          if (transcript.trim()) {
            const finalText = transcript.trim();
            
            // Stop keyword kontrolü
            const stopWords = options?.stopOnKeywords || ['tamam', 'bitti', 'ok', 'kaydet'];
            const lowerText = finalText.toLowerCase();
            
            const foundStopWord = stopWords.find(word => 
              lowerText.endsWith(word.toLowerCase())
            );

            if (foundStopWord) {
              // Stop word'ü metnin sonundan çıkar
              const commandIndex = lowerText.lastIndexOf(foundStopWord.toLowerCase());
              const cleanedText = finalText.substring(0, commandIndex).trim();
              
              if (cleanedText) {
                onTranscriptReadyRef.current(cleanedText);
              }
            } else if (!options?.continuous) {
              // Continuous olmayan modda sonucu işle
              onTranscriptReadyRef.current(finalText);
            }
          }
          
          setIsListening(false);
          recognitionActiveRef.current = false;
        }
      });

      // Listener'ları sakla (temizlik için)
      listenersRef.current = [partialResultsListener, listeningStateListener];

    } catch (error) {
      console.error('[SpeechRecognition] Start failed:', error);
      setIsListening(false);
      recognitionActiveRef.current = false;
    }
  }, [hasSupport, isAvailable, options]);

  const stopListening = useCallback(async () => {
    if (!recognitionActiveRef.current) {
      return;
    }

    try {
      console.log('[SpeechRecognition] Stopping...');
      await SpeechRecognition.stop();
      
      // Tüm listener'ları kaldır
      listenersRef.current.forEach(listener => {
        listener.remove();
      });
      listenersRef.current = [];
      
      setIsListening(false);
      recognitionActiveRef.current = false;
      console.log('[SpeechRecognition] Stopped');
    } catch (error) {
      console.error('[SpeechRecognition] Stop failed:', error);
      setIsListening(false);
      recognitionActiveRef.current = false;
      
      // Hata olsa bile listener'ları temizle
      listenersRef.current.forEach(listener => {
        listener.remove();
      });
      listenersRef.current = [];
    }
  }, []);

  // Unmount'ta temizlik
  useEffect(() => {
    return () => {
      if (recognitionActiveRef.current) {
        stopListening();
      }
      // Listener'ları temizle
      listenersRef.current.forEach(listener => {
        listener.remove();
      });
      listenersRef.current = [];
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport: hasSupport && isAvailable,
    isAvailable,
  };
};

// Named export
export { useSpeechRecognitionUnified as useSpeechRecognition };
```

**Özellikler:**
- Native iOS ve Android desteği
- İzin yönetimi
- Partial results (ara sonuçlar)
- Stop keyword desteği
- Otomatik temizlik (cleanup)
- Event listener yönetimi

**Capacitor Konfigürasyonu:**

```json
// capacitor.config.json
{
  "plugins": {
    "SpeechRecognition": {
      "language": "tr-TR",
      "popup": false,
      "partialResults": true
    }
  }
}
```

**Platform Desteği:**
- ✅ iOS 10+
- ✅ Android 5.0+
- ❌ Web (fallback to Web Speech API)

### Speech Recognition Manager (Singleton Pattern)

**Konum:** `src/hooks/speechRecognitionManager.ts`

Bu singleton sınıf, Web Speech API'nin tek bir kez başlatılmasını ve log'ların tekrarlanmamasını sağlar:

```typescript
// Singleton manager for Web Speech API
// Bu, kaç tane hook oluşturulursa oluşturulsun sadece bir kez başlatma log'u sağlar

class SpeechRecognitionManager {
  private static instance: SpeechRecognitionManager;
  private supportChecked = false;
  private hasSupport = false;
  private isElectron = false;
  
  private constructor() {}
  
  static getInstance(): SpeechRecognitionManager {
    if (!SpeechRecognitionManager.instance) {
      SpeechRecognitionManager.instance = new SpeechRecognitionManager();
    }
    return SpeechRecognitionManager.instance;
  }
  
  checkSupport(): { hasSupport: boolean; isElectron: boolean } {
    if (this.supportChecked) {
      return { hasSupport: this.hasSupport, isElectron: this.isElectron };
    }
    
    this.supportChecked = true;
    this.isElectron = !!(window as any).isElectron || !!(window as any).electronAPI;
    
    const WebSpeechRecognitionAPI = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (WebSpeechRecognitionAPI) {
      this.hasSupport = true;
      console.log('[SpeechManager] Web Speech API destekleniyor:', {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
    } else {
      this.hasSupport = false;
      console.warn('[SpeechManager] Web Speech API desteklenmiyor:', {
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      });
    }
    
    return { hasSupport: this.hasSupport, isElectron: this.isElectron };
  }
  
  createRecognitionInstance() {
    const WebSpeechRecognitionAPI = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!WebSpeechRecognitionAPI) {
      throw new Error('Web Speech API not supported');
    }
    
    return new WebSpeechRecognitionAPI();
  }
}

export const speechRecognitionManager = SpeechRecognitionManager.getInstance();
```

**Kullanım Amacı:**
- Tek bir destek kontrolü (performans)
- Tekrarlayan log'ları önleme
- Merkezi yönetim
- Memory leak'leri önleme

**Kullanım Örneği:**

```typescript
import { speechRecognitionManager } from './speechRecognitionManager';

// Destek kontrolü
const { hasSupport, isElectron } = speechRecognitionManager.checkSupport();

// Recognition instance oluşturma
if (hasSupport) {
  const recognition = speechRecognitionManager.createRecognitionInstance();
  recognition.lang = 'tr-TR';
  recognition.start();
}
```

## Test Stratejisi

### 1. Birim Testleri

**Test Edilecek Fonksiyonlar:**
- `startListening()`: Konuşma tanımayı başlatma
- `stopListening()`: Konuşma tanımayı durdurma
- `handleTranscript()`: Sesli komut algılama
- Komut regex'leri: Doğru komutları yakalama

**Mock Objeler:**
```typescript
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: '',
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null
};
```

### 2. Entegrasyon Testleri

**Senaryolar:**
1. Kullanıcı mikrofon butonuna tıklar
2. Konuşma tanıma başlar
3. Kullanıcı "Bugün hava çok güzel tamam" der
4. Not "Bugün hava çok güzel" olarak kaydedilir

### 3. Manuel Testler

**Test Matrisi:**

| Tarayıcı | Platform | Türkçe | İngilizce | Durum |
|----------|----------|--------|-----------|-------|
| Chrome   | Windows  | ✅     | ✅        | Çalışıyor |
| Chrome   | macOS    | ✅     | ✅        | Çalışıyor |
| Edge     | Windows  | ✅     | ✅        | Çalışıyor |
| Safari   | macOS    | ⚠️     | ⚠️        | Kısmi |
| Firefox  | Tümü     | ❌     | ❌        | Desteklemiyor |

### 4. Performans Testleri

**Metrikler:**
- Başlatma süresi: < 500ms
- Metin güncelleme gecikmesi: < 100ms
- Komut algılama süresi: < 200ms
- Bellek kullanımı: < 50MB

## Hata Yönetimi

### Hata Tipleri ve Çözümleri

| Hata Kodu | Açıklama | Çözüm |
|-----------|----------|-------|
| `no-speech` | Konuşma algılanmadı | Kullanıcıya tekrar denemesini söyle |
| `audio-capture` | Mikrofon erişim hatası | Mikrofon bağlantısını kontrol et |
| `not-allowed` | İzin verilmedi | İzin ayarlarını kontrol et |
| `network` | Ağ hatası | İnternet bağlantısını kontrol et |
| `aborted` | İşlem iptal edildi | Yeniden başlat |

### Kullanıcı Bildirimleri

```typescript
const errorMessages = {
  'no-speech': {
    tr: 'Konuşma algılanamadı. Lütfen tekrar deneyin.',
    en: 'No speech detected. Please try again.'
  },
  'audio-capture': {
    tr: 'Mikrofon erişim hatası. Lütfen mikrofonunuzu kontrol edin.',
    en: 'Microphone access error. Please check your microphone.'
  },
  'not-allowed': {
    tr: 'Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.',
    en: 'Microphone permission denied. Please allow access in browser settings.'
  },
  'network': {
    tr: 'Ağ hatası. Lütfen internet bağlantınızı kontrol edin.',
    en: 'Network error. Please check your internet connection.'
  }
};
```

## Güvenlik Konuları

### 1. Mikrofon İzinleri

- Kullanıcı izni olmadan mikrofon erişimi yapılmaz
- İzin durumu tarayıcı tarafından yönetilir
- HTTPS gereklidir (localhost hariç)

### 2. Veri Gizliliği

- Ses verileri tarayıcı tarafından işlenir
- Hiçbir ses kaydı sunucuya gönderilmez
- Sadece metin sonuçları yerel olarak saklanır

### 3. HTTPS Gereksinimleri

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    https: process.env.NODE_ENV === 'production',
    // Geliştirme ortamında localhost için HTTPS gerekmez
  }
});
```

## Optimizasyonlar

### 1. Performans

- `useCallback` ile fonksiyon memoization
- `useRef` ile DOM referansları
- Gereksiz re-render'ları önleme

### 2. Kullanıcı Deneyimi

- Gerçek zamanlı metin güncelleme
- Görsel geri bildirim (animasyonlar)
- Akıllı komut algılama
- Çoklu dil desteği

### 3. Hata Toleransı

- Otomatik yeniden başlatma (Electron)
- Graceful degradation (tarayıcı desteklemiyorsa)
- Kullanıcı dostu hata mesajları

## Kod Kopyalama Rehberi

### 1. Temel Web Speech API Entegrasyonu (En Basit)

**Hedef:** Tarayıcıda basit speech-to-text

**Kopyalanacak Kod:**
```typescript
// DailyNotepad.tsx içinden (satır 119-230)
const [isListening, setIsListening] = useState(false);
const [hasSupport, setHasSupport] = useState(false);
const recognitionRef = useRef<any>(null);

useEffect(() => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  setHasSupport(!!SpeechRecognition);
}, []);

const handleTranscript = useCallback((finalTranscript: string) => {
  // Komut algılama ve işleme
  // ... (tam kod yukarıda)
}, [lang, newNoteImageDataUrl, handleAddNote, setNotification]);

const startListening = useCallback(() => {
  // Speech recognition başlatma
  // ... (tam kod yukarıda)
}, [hasSupport, isListening, lang, handleTranscript, setNotification]);

const stopListening = useCallback(() => {
  // Speech recognition durdurma
  // ... (tam kod yukarıda)
}, []);
```

**Gereksinimler:**
- ❌ Harici kütüphane yok
- ✅ Modern tarayıcı (Chrome, Edge, Safari 14.1+)
- ✅ HTTPS (production için)

### 2. Electron + Gemini API Entegrasyonu (Gelişmiş)

**Hedef:** Electron uygulamasında yüksek kaliteli speech-to-text

**Kopyalanacak Dosyalar:**
1. `src/hooks/useElectronSpeechRecognition.ts` (tam dosya)
2. `src/services/geminiService.ts` (speechToText metodu)

**Gereksinimler:**
- ✅ Gemini API anahtarı
- ✅ MediaRecorder API
- ✅ Electron ortamı
- 💰 API kullanım ücreti

**Kurulum:**
```bash
npm install @google/generative-ai
```

**Kullanım:**
```typescript
import { useElectronSpeechRecognition } from './hooks/useElectronSpeechRecognition';

const { isListening, transcript, startListening, stopListening, hasSupport } = 
  useElectronSpeechRecognition(
    (text) => {
      console.log('Transcript:', text);
    },
    {
      continuous: true,
      stopOnKeywords: ['tamam', 'bitti', 'kaydet']
    }
  );
```

### 3. Capacitor Mobil Entegrasyonu

**Hedef:** iOS ve Android native speech recognition

**Kopyalanacak Dosyalar:**
1. `src/hooks/useSpeechRecognitionUnified.ts` (tam dosya)

**Gereksinimler:**
- ✅ Capacitor projesi
- ✅ @capacitor-community/speech-recognition plugin

**Kurulum:**
```bash
npm install @capacitor-community/speech-recognition
npx cap sync
```

**iOS Konfigürasyonu (Info.plist):**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Sesli not eklemek için mikrofon erişimi gereklidir</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Konuşmanızı metne dönüştürmek için izin gereklidir</string>
```

**Android Konfigürasyonu (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 4. Singleton Manager (Opsiyonel)

**Hedef:** Performans optimizasyonu ve log kontrolü

**Kopyalanacak Dosyalar:**
1. `src/hooks/speechRecognitionManager.ts` (tam dosya)

**Kullanım:**
```typescript
import { speechRecognitionManager } from './hooks/speechRecognitionManager';

const { hasSupport, isElectron } = speechRecognitionManager.checkSupport();
const recognition = speechRecognitionManager.createRecognitionInstance();
```

### Hangi Yaklaşımı Seçmeliyim?

```
┌─────────────────────────────────────────────────────────────┐
│                    Karar Ağacı                              │
└─────────────────────────────────────────────────────────────┘

Projeniz nedir?
│
├─ Web Uygulaması
│  │
│  ├─ Basit kullanım → Web Speech API (Yaklaşım 1)
│  └─ Gelişmiş özellikler → Gemini API (Yaklaşım 2)
│
├─ Electron Uygulaması
│  │
│  ├─ Ücretsiz çözüm → Web Speech API (Yaklaşım 1)
│  └─ Yüksek kalite → Gemini API (Yaklaşım 2)
│
└─ Mobil Uygulama (Capacitor)
   │
   └─ Native destek → Capacitor Plugin (Yaklaşım 3)
```

### Maliyet Karşılaştırması

| Yaklaşım | Kurulum | Çalışma | API Maliyeti |
|----------|---------|---------|--------------|
| Web Speech API | 🆓 Ücretsiz | 🆓 Ücretsiz | 🆓 Yok |
| Gemini API | 🆓 Ücretsiz | 💰 Ücretli | 💰 ~$0.001/istek |
| Capacitor | 🆓 Ücretsiz | 🆓 Ücretsiz | 🆓 Yok |

### Kod Entegrasyon Adımları

#### Adım 1: Dosyaları Kopyala
```bash
# Web Speech API için
cp src/components/DailyNotepad.tsx your-project/

# Electron için
cp src/hooks/useElectronSpeechRecognition.ts your-project/hooks/
cp src/services/geminiService.ts your-project/services/

# Capacitor için
cp src/hooks/useSpeechRecognitionUnified.ts your-project/hooks/
```

#### Adım 2: Bağımlılıkları Yükle
```bash
# Gemini API için
npm install @google/generative-ai

# Capacitor için
npm install @capacitor-community/speech-recognition
npx cap sync
```

#### Adım 3: Konfigürasyon
```typescript
// .env dosyası (Gemini için)
VITE_GEMINI_API_KEY=your_api_key_here

// capacitor.config.json (Capacitor için)
{
  "plugins": {
    "SpeechRecognition": {
      "language": "tr-TR"
    }
  }
}
```

#### Adım 4: Kullanım
```typescript
// Component içinde
import { useElectronSpeechRecognition } from './hooks/useElectronSpeechRecognition';

function MyComponent() {
  const { isListening, startListening, stopListening } = 
    useElectronSpeechRecognition((text) => {
      console.log('Transcript:', text);
    });

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? 'Durdur' : 'Başlat'}
    </button>
  );
}
```

## Gelecek Geliştirmeler

### Potansiyel İyileştirmeler

1. **Offline Destek**
   - Tarayıcı offline konuşma tanıma modelleri
   - Yerel model indirme

2. **Gelişmiş Komutlar**
   - Daha fazla sesli komut
   - Özel komut tanımlama
   - Komut makroları

3. **Ses Geri Bildirimi**
   - Komut onay sesleri
   - Hata sesleri
   - Başarı sesleri

4. **Çoklu Konuşmacı**
   - Konuşmacı tanıma
   - Konuşmacı bazlı notlar

5. **Gelişmiş Dil Desteği**
   - Daha fazla dil
   - Lehçe tanıma
   - Otomatik dil algılama
