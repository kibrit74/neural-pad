import { ipcMain } from 'electron';
import { pipeline, env } from '@huggingface/transformers';

// Model cache için path
env.cacheDir = './.cache';

let recognizer = null;
let isInitialized = false;

// Initialize the speech recognition model
async function initializeRecognizer() {
  if (isInitialized) return recognizer;
  
  try {
    console.log('Initializing Whisper model...');
    // Whisper tiny model - küçük ve hızlı (Türkçe destekli)
    recognizer = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      { quantized: true }
    );
    isInitialized = true;
    console.log('Whisper model initialized successfully');
    return recognizer;
  } catch (error) {
    console.error('Failed to initialize Whisper model:', error);
    throw error;
  }
}

// Setup IPC handlers for speech recognition
export function setupSpeechRecognition() {
  // Initialize model
  ipcMain.handle('speech:initialize', async () => {
    try {
      await initializeRecognizer();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Transcribe audio
  ipcMain.handle('speech:transcribe', async (event, audioData) => {
    try {
      if (!isInitialized) {
        console.log('Model not initialized, initializing now...');
        await initializeRecognizer();
      }

      // Reconstruct Float32Array from various possible shapes
      let float32;
      if (audioData instanceof Float32Array) {
        float32 = audioData;
      } else if (audioData?.buffer && audioData.BYTES_PER_ELEMENT === 4 && audioData.length) {
        // Likely came across the bridge preserving typed array fields
        float32 = new Float32Array(audioData.buffer);
      } else if (audioData instanceof ArrayBuffer) {
        float32 = new Float32Array(audioData);
      } else if (Array.isArray(audioData)) {
        float32 = new Float32Array(audioData);
      } else if (audioData?.type === 'Buffer') {
        float32 = new Float32Array(new Uint8Array(audioData).buffer);
      } else {
        throw new Error('Unsupported audio payload');
      }

      console.log('Transcribing Float32 audio, samples:', float32.length);
      
      const result = await recognizer(float32, {
        language: 'turkish',
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: false,
      });

      console.log('Transcription result:', result.text);
      return { success: true, text: result.text };
    } catch (error) {
      console.error('Transcription error details:', error);
      console.error('Error stack:', error.stack);
      return { success: false, error: error.message || String(error) };
    }
  });

  // Check if initialized
  ipcMain.handle('speech:isInitialized', () => {
    return isInitialized;
  });
}
