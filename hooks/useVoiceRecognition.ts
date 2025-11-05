import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecognitionOptions {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (error: any) => void;
    lang?: 'tr' | 'en';
}

export type VoiceRecognitionResult = {
    isRecording: boolean;
    isInitializing: boolean;
    start: () => void;
    stop: () => void;
    hasSupport: boolean;
};

// Singleton manager for Web Speech API
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
    
    // Check for Electron environment
    const windowElectron = !!(window as any).electron;
    const windowElectronAPI = !!(window as any).electronAPI;
    const windowIsElectron = !!(window as any).isElectron;
    this.isElectron = windowIsElectron || windowElectronAPI || windowElectron;
    
    const WebSpeechRecognitionAPI = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (WebSpeechRecognitionAPI) {
      this.hasSupport = true;
      console.log('[SpeechManager] Web Speech API supported');
    } else {
      this.hasSupport = false;
      console.warn('[SpeechManager] Web Speech API not supported');
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

/**
 * Web Speech API implementation for voice recognition
 * Works in both Web and Electron environments
 */
export const useVoiceRecognition = (options: VoiceRecognitionOptions): VoiceRecognitionResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasSupport, setHasSupport] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(options.onResult);
  const onErrorRef = useRef(options.onError);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lang = options.lang || 'tr';

  useEffect(() => {
    onResultRef.current = options.onResult;
    onErrorRef.current = options.onError;
  }, [options.onResult, options.onError]);

  useEffect(() => {
    // Check for Web Speech API support
    const { hasSupport: supported } = speechRecognitionManager.checkSupport();
    setHasSupport(supported);
    
    if (!supported) {
      console.error('[useVoiceRecognition] Web Speech API not supported');
      if (onErrorRef.current) onErrorRef.current(new Error('not_supported'));
      return;
    }

    try {
      const recognition = speechRecognitionManager.createRecognitionInstance();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
    
    recognition.onresult = (event: any) => {
      retryCountRef.current = 0;
      
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      const isFinal = event.results[event.results.length - 1]?.isFinal;
      
      if (transcript) {
        onResultRef.current(transcript, isFinal);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('[useVoiceRecognition] Error:', event.error);
      
      if (event.error === 'network') {
        setIsRecording(false);
        
        // Show user-friendly message for Electron
        const isElectron = !!(window as any).electron || !!(window as any).electronAPI;
        if (isElectron) {
          alert('⚠️ Ses Tanıma Hatası\n\nElectron uygulamasında Web Speech API çalışmıyor.\n\nLütfen metni manuel olarak yazın.');
        }
        
        if (onErrorRef.current) onErrorRef.current('network_fallback');
      } else if (event.error === 'not-allowed') {
        setIsRecording(false);
        if (onErrorRef.current) onErrorRef.current('not-allowed');
      } else {
        if (onErrorRef.current) onErrorRef.current(event.error);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      if (isRecording) {
        retryCountRef.current = 0;
        
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        
        restartTimeoutRef.current = setTimeout(() => {
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('[useVoiceRecognition] Restart failed:', e);
            }
          }
        }, 100);
      } else {
        setIsRecording(false);
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      if (recognition) {
        try { 
          recognition.stop(); 
        } catch(e) {
          console.error('[useVoiceRecognition] Stop error:', e);
        }
      }
    };
  } catch (error) {
    console.error('[useVoiceRecognition] Init error:', error);
    if (onErrorRef.current) onErrorRef.current(error);
  }
  }, [isRecording, lang]);
  
  const start = useCallback(async () => {
    if (!hasSupport || isRecording) return;
    
    retryCountRef.current = 0;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    try {
      // First, request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      // Now start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (e) {
      console.error('[useVoiceRecognition] Start failed:', e);
      if (onErrorRef.current) onErrorRef.current(e);
    }
  }, [hasSupport, isRecording]);
  
  const stop = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    } catch (e) {
      console.error('[useVoiceRecognition] Stop failed:', e);
      if (onErrorRef.current) onErrorRef.current(e);
    }
  }, []);
  
  return { isRecording, isInitializing: false, start, stop, hasSupport };
};
