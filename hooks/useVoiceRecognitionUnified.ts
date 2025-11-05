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
  
  // Always use Web Speech API (works in both Electron and browser)
  const webResult = useVoiceRecognition(options);
  
  console.log('[VoiceRecognitionUnified] Using Web Speech API');
  return webResult;
};
