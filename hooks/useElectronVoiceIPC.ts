import { useState, useEffect, useCallback, useRef } from 'react';

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

/**
 * Electron IPC-based voice recognition
 * Uses Main Process as proxy to avoid CORS issues
 */
export const useElectronVoiceIPC = (options: VoiceRecognitionOptions): VoiceRecognitionResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasSupport, setHasSupport] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const onResultRef = useRef(options.onResult);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onResultRef.current = options.onResult;
    onErrorRef.current = options.onError;
  }, [options.onResult, options.onError]);

  useEffect(() => {
    // Check if we're in Electron and have IPC support
    const electronAPI = (window as any).electron;
    const isElectron = !!electronAPI?.speech?.sendAudioData;
    setHasSupport(isElectron && typeof MediaRecorder !== 'undefined');
    
    if (isElectron) {
      console.log('[ElectronVoiceIPC] IPC speech support detected');
      
      // Listen for transcription results
      const removeListener = electronAPI.speech.onTranscription((text: string) => {
        console.log('[ElectronVoiceIPC] Received transcription:', text);
        onResultRef.current(text, true);
      });
      
      return () => {
        removeListener();
      };
    }
  }, []);

  const start = useCallback(async () => {
    if (!hasSupport || isRecording) return;
    
    try {
      console.log('[ElectronVoiceIPC] Starting recording...');
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder
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
        console.log('[ElectronVoiceIPC] Recording stopped, processing...');
        
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to ArrayBuffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Send to main process via IPC
        const electronAPI = (window as any).electron;
        try {
          const result = await electronAPI.speech.sendAudioData(uint8Array);
          console.log('[ElectronVoiceIPC] IPC result:', result);
        } catch (error) {
          console.error('[ElectronVoiceIPC] IPC error:', error);
          if (onErrorRef.current) onErrorRef.current(error);
        }
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsRecording(false);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      console.log('[ElectronVoiceIPC] Recording started');
      
    } catch (error) {
      console.error('[ElectronVoiceIPC] Start error:', error);
      if (onErrorRef.current) onErrorRef.current(error);
      setIsRecording(false);
    }
  }, [hasSupport, isRecording]);

  const stop = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    console.log('[ElectronVoiceIPC] Stopping recording...');
    
    try {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error('[ElectronVoiceIPC] Stop error:', error);
      if (onErrorRef.current) onErrorRef.current(error);
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, isInitializing: false, start, stop, hasSupport };
};
