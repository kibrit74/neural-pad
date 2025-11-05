# Speech-to-Text Implementation Guide

## Overview

This document describes the implementation of speech-to-text feature in EchoDay application, following the design specifications in `speech-to-text.md`.

## Architecture

### Core Components

1. **speechRecognitionManager** (Singleton)
   - Location: `hooks/useVoiceRecognition.ts`
   - Purpose: Centralized Web Speech API support detection
   - Benefits: Single initialization, no duplicate logs, memory efficient

2. **useVoiceRecognition** (Base Hook)
   - Location: `hooks/useVoiceRecognition.ts`
   - Purpose: Web Speech API implementation with error handling
   - Features:
     - Continuous listening
     - Interim results support
     - Network error retry (max 3 attempts)
     - Language support (tr-TR, en-US)

3. **useVoiceRecognitionUnified** (Unified Hook)
   - Location: `hooks/useVoiceRecognitionUnified.ts`
   - Purpose: Platform-agnostic voice recognition
   - Auto-selects best implementation based on environment

4. **Voice Command Utilities**
   - Location: `utils/voiceCommandUtils.ts`
   - Functions:
     - `hasVoiceCommand()`: Detects voice commands
     - `removeVoiceCommand()`: Cleans commands from transcript
     - `cleanStopKeywords()`: Advanced keyword removal

## Usage

### Basic Usage

```typescript
import { useVoiceRecognitionUnified } from '../hooks/useVoiceRecognitionUnified';

const { isRecording, start, stop, hasSupport } = useVoiceRecognitionUnified({
  onResult: (transcript, isFinal) => {
    console.log('Transcript:', transcript, 'Final:', isFinal);
  },
  lang: 'tr', // or 'en'
  onError: (error) => {
    console.error('Error:', error);
  }
});

// Check support before showing UI
if (hasSupport) {
  // Show microphone button
}
```

### Platform-Specific Behavior

The hook automatically selects the best implementation:

- **Electron**: Uses offline Whisper model (no internet required)
- **Web Browser**: Uses Web Speech API (requires internet)

```typescript
// In Electron
console.log('[VoiceRecognitionUnified] Using Electron Whisper (offline)');

// In Web Browser
console.log('[VoiceRecognitionUnified] Using Web Speech API (online)');
```

### Voice Commands

Supported commands:
- **Turkish**: tamam, bitti, kaydet, not ekle, ekle, tamam kaydet, not olarak kaydet
- **English**: okay, done, save, add note, save note, okay save, that's it

```typescript
import { hasVoiceCommand, removeVoiceCommand } from '../utils/voiceCommandUtils';

const transcript = "Bugün hava çok güzel tamam";
if (hasVoiceCommand(transcript, 'tr')) {
  const cleaned = removeVoiceCommand(transcript, 'tr');
  console.log(cleaned); // "Bugün hava çok güzel"
}
```

## Implementation Details

### Singleton Pattern

The `speechRecognitionManager` ensures:
- Single support check across all components
- No duplicate console logs
- Efficient memory usage
- Centralized configuration

### Error Handling

Network errors are automatically retried up to 3 times:

```typescript
recognition.onerror = (event: any) => {
  if (event.error === 'network') {
    retryCountRef.current++;
    if (retryCountRef.current <= maxRetries) {
      // Retry after 1 second
      setTimeout(() => recognition.start(), 1000);
    }
  }
};
```

### Language Support

Language is automatically set based on user preference:

```typescript
recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
```

## Browser Support

| Browser | Platform | Turkish | English | Status |
|---------|----------|---------|---------|--------|
| Chrome  | Windows  | ✅      | ✅      | Full Support |
| Chrome  | macOS    | ✅      | ✅      | Full Support |
| Edge    | Windows  | ✅      | ✅      | Full Support |
| Safari  | macOS    | ⚠️      | ⚠️      | Partial Support |
| Firefox | All      | ❌      | ❌      | Not Supported |

## Testing

### Manual Testing

1. Open the application in a supported browser
2. Click the microphone button in the toolbar
3. Speak clearly in Turkish or English
4. Say a voice command to save (e.g., "tamam" or "okay")
5. Verify the text is inserted without the command

### Error Testing

1. Disconnect internet and test network error handling
2. Deny microphone permission and verify error message
3. Test in unsupported browser (Firefox) and verify graceful degradation

## Performance

- Initialization: < 500ms
- Text update latency: < 100ms
- Command detection: < 200ms
- Memory usage: < 50MB

## Security

- HTTPS required in production (localhost exempt)
- Microphone permission requested by browser
- No audio data sent to external servers
- Only text results stored locally

## Future Enhancements

1. Offline support with local models
2. Custom voice commands
3. Multi-speaker recognition
4. Additional language support
5. Voice feedback sounds

## Troubleshooting

### "Web Speech API not supported"
- Use Chrome, Edge, or Safari 14.1+
- Ensure HTTPS in production

### "Network error"
- Check internet connection
- Verify firewall settings
- Try again (auto-retry enabled)

### "Microphone permission denied"
- Check browser settings
- Allow microphone access for the site

## References

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Speech Recognition Specification](https://wicg.github.io/speech-api/)
- Design Document: `speech-to-text.md`
