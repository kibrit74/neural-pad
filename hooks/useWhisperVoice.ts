import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { transcribeAudio } from '../services/geminiService';
import type { Settings } from '../types';

interface WhisperVoiceOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  settings?: Settings; // Gemini API key için
  useGemini?: boolean; // Gemini kullan mı yoksa Whisper mı
}

// Simple high-pass filter to reduce low-frequency noise
const applyHighPassFilter = (audioData: Float32Array, sampleRate: number): Float32Array => {
  const filtered = new Float32Array(audioData.length);
  const cutoffFreq = 80; // Hz - remove very low frequencies (rumble, wind)
  const RC = 1.0 / (cutoffFreq * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = RC / (RC + dt);
  
  filtered[0] = audioData[0];
  for (let i = 1; i < audioData.length; i++) {
    filtered[i] = alpha * (filtered[i - 1] + audioData[i] - audioData[i - 1]);
  }
  
  return filtered;
};

// Create WAV blob from Float32Array
const createWavBlob = (audioData: Float32Array, sampleRate: number): Blob => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = audioData.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
};

export const useWhisperVoice = (options: WhisperVoiceOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { language } = useLanguage();
  
  // Determine which service to use
  const isElectron = !!(window as any).electron;
  const hasGeminiKey = !!(options.settings?.geminiApiKey);
  const hasWhisper = isElectron && !!(window as any).electron?.whisper;
  
  // Use Gemini 2.0 Flash for audio transcription
  const useGemini = options.useGemini ?? (hasGeminiKey && !hasWhisper); // Prefer Gemini if available

  const start = useCallback(async () => {
    try {
      // Request high-quality audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // High quality capture
          channelCount: 1
        } 
      });
      
      // Use highest quality codec available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000 // High bitrate for better quality
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Skip if audio is too short (less than 0.5 seconds)
          if (audioBlob.size < 8000) {
            console.log('[Whisper] Audio too short, skipping transcription');
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          // Convert WebM to higher quality WAV - 16kHz is Whisper's native rate
          // Using 16kHz matches Whisper's training data for best accuracy
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Get audio data as Float32Array
          const audioData = audioBuffer.getChannelData(0);
          
          // Skip if audio duration is too short
          if (audioBuffer.duration < 0.3) {
            console.log('[Whisper] Audio duration too short, skipping transcription');
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          // Apply noise reduction - simple high-pass filter
          const filteredAudio = applyHighPassFilter(audioData, 16000);
          
          let transcript = '';
          
          // Use Gemini or Whisper based on settings
          if (useGemini && options.settings?.geminiApiKey) {
            console.log('[Audio] Using Gemini for transcription');
            
            // Create WAV file from Float32Array for Gemini
            const wavBlob = createWavBlob(filteredAudio, 16000);
            const wavArrayBuffer = await wavBlob.arrayBuffer();
            const audioBytes = new Uint8Array(wavArrayBuffer);
            
            try {
              // Use audio/mp3 as per Gemini docs (but we're sending WAV data)
              // Gemini should auto-detect the format
              transcript = await transcribeAudio(
                audioBytes,
                'audio/wav',
                language,
                options.settings
              );
              
              if (transcript.trim()) {
                options.onResult(transcript, true);
              } else {
                console.log('[Gemini] Empty transcript, skipping');
              }
            } catch (error: any) {
              console.error('[Gemini] Transcription failed:', error);
              // Don't fallback to Whisper - just report error
              // Whisper needs to be started first, which we're not doing when using Gemini
              options.onError?.(error);
            }
          } else if (isElectron && (window as any).electron?.whisper) {
            // Use Whisper (Electron only)
            console.log('[Audio] Using Whisper for transcription');
            const audioBytes = new Uint8Array(filteredAudio.buffer);
            
            const result = await (window as any).electron.whisper.transcribe(
              audioBytes,
              language
            );

            if (result.success && result.transcript.trim()) {
              options.onResult(result.transcript, true);
            } else if (!result.transcript.trim()) {
              console.log('[Whisper] Empty transcript, skipping');
            } else {
              options.onError?.(result.error);
            }
          } else {
            const errorMsg = useGemini 
              ? 'Gemini API key not found. Please add your API key in Settings.'
              : 'No transcription service available';
            options.onError?.(new Error(errorMsg));
          }
        } catch (error) {
          options.onError?.(error);
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      options.onError?.(error);
    }
  }, [language, options]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    start,
    stop,
    hasSupport: hasWhisper || hasGeminiKey
  };
};
