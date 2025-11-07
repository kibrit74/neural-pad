import { useVoiceRecognition, speechRecognitionManager } from './useVoiceRecognition';
import { useElectronVoiceIPC } from './useElectronVoiceIPC';

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
 * Unified voice recognition hook
 * - Electron: Uses IPC proxy to Main Process (no CORS!)
 * - Web: Uses Web Speech API
 */
export const useVoiceRecognitionUnified = (options: VoiceRecognitionOptions): VoiceRecognitionResult => {
  const { isElectron } = speechRecognitionManager.checkSupport();
  
  // Use Electron IPC in Electron environment, Web Speech API in browser
  if (isElectron) {
    console.log('[VoiceRecognitionUnified] Using Electron IPC voice recognition');
    return useElectronVoiceIPC(options);
  } else {
    console.log('[VoiceRecognitionUnified] Using Web Speech API');
    return useVoiceRecognition(options);
  }
};
