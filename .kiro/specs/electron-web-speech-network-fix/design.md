# Design Document

## Overview

The Web Speech API network errors in Electron are caused by conflicting command-line switches and missing speech-specific configuration. The current implementation has `disable-background-networking` enabled in production, which blocks the Web Speech API from connecting to Google's servers. Additionally, Electron requires specific command-line switches to enable speech input features.

This design implements a targeted fix that:
1. Adds required command-line switches for speech recognition
2. Conditionally disables network-blocking switches when speech features are needed
3. Maintains existing CSP and permission configurations (which are already correct)
4. Adds comprehensive logging for debugging

## Architecture

### Current State Analysis

**What's Working:**
- CSP headers correctly allow Google speech domains
- Permission handlers properly grant microphone access
- Web Speech API is detected and initialized
- useVoiceRecognition hook is properly structured

**Root Cause of Network Errors:**
1. `disable-background-networking` switch blocks all background network requests, including Web Speech API
2. Missing `enable-speech-input` command-line switch
3. `OutOfBlinkCors` feature may be interfering with cross-origin requests to Google

### Solution Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Command-Line Switches (Before app.ready)            │
│     ├─ enable-speech-input                              │
│     ├─ enable-speech-dispatcher                         │
│     └─ Conditionally disable network blocking           │
│                                                           │
│  2. CSP Configuration (app.ready)                        │
│     └─ Allow *.google.com, *.googleapis.com             │
│                                                           │
│  3. Permission Handlers                                  │
│     └─ Auto-grant microphone permissions                │
│                                                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Renderer Process (React)                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  useVoiceRecognition Hook                                │
│     ├─ Initialize Web Speech API                        │
│     ├─ Handle network errors with detailed logging      │
│     └─ Provide user feedback                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Electron Main Process Configuration

**File:** `electron/main.cjs`

**Changes Required:**

```javascript
// Add speech-specific command-line switches
app.commandLine.appendSwitch('enable-speech-input');
app.commandLine.appendSwitch('enable-speech-dispatcher');

// Conditionally apply network restrictions
// Only disable background networking for non-speech features
if (!isDev) {
  // Remove or comment out: app.commandLine.appendSwitch('disable-background-networking');
  app.commandLine.appendSwitch('disable-client-side-phishing-detection');
  app.commandLine.appendSwitch('no-proxy-server');
  // Keep autofill restrictions
  app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,AutofillAddressProfileSavePrompt');
}
```

**Rationale:**
- `enable-speech-input`: Explicitly enables speech recognition features in Chromium
- `enable-speech-dispatcher`: Enables the speech dispatcher service
- Removing `disable-background-networking`: This switch was blocking Web Speech API connections

### 2. Enhanced Error Handling

**File:** `hooks/useVoiceRecognition.ts`

**Current Error Handler:**
```typescript
const onError = (event: any) => {
  console.error('[useVoiceRecognition] Error:', event.error);
  // Basic error handling
};
```

**Enhanced Error Handler:**
```typescript
const onError = (event: any) => {
  const errorType = event.error;
  console.error('[useVoiceRecognition] Error:', errorType);
  
  // Detailed error logging
  const errorDetails = {
    type: errorType,
    timestamp: new Date().toISOString(),
    isOnline: navigator.onLine,
    language: recognitionRef.current?.lang,
  };
  
  console.error('[useVoiceRecognition] Error Details:', errorDetails);
  
  // User-friendly error messages
  const errorMessages = {
    'network': 'Unable to connect to speech recognition service. Please check your internet connection.',
    'not-allowed': 'Microphone permission denied. Please allow microphone access in your browser settings.',
    'service-not-allowed': 'Speech recognition service is not available.',
    'aborted': 'Speech recognition was aborted.',
    'no-speech': 'No speech was detected. Please try again.',
    'audio-capture': 'Microphone is not available or already in use.',
  };
  
  const userMessage = errorMessages[errorType] || `Speech recognition error: ${errorType}`;
  
  // Call user's error handler
  onErrorRef.current?.(errorType);
  
  // Log for debugging
  console.log('[useVoiceRecognition] User Message:', userMessage);
};
```

### 3. Initialization Logging

**File:** `hooks/useVoiceRecognition.ts`

Add comprehensive logging during initialization:

```typescript
const start = useCallback(() => {
  if (!hasSupport) {
    console.error('[useVoiceRecognition] Cannot start: Web Speech API not supported');
    return;
  }
  
  if (isRecording) {
    console.warn('[useVoiceRecognition] Already recording');
    return;
  }
  
  try {
    console.log('[useVoiceRecognition] Starting recognition...');
    console.log('[useVoiceRecognition] Language:', lang);
    console.log('[useVoiceRecognition] Online status:', navigator.onLine);
    
    recognitionRef.current.start();
    setIsRecording(true);
    
    console.log('[useVoiceRecognition] Recognition started successfully');
  } catch (error) {
    console.error('[useVoiceRecognition] Failed to start:', error);
    onErrorRef.current?.(error);
  }
}, [hasSupport, isRecording, lang]);
```

## Data Models

No data model changes required. The existing voice recognition interfaces remain unchanged:

```typescript
interface VoiceRecognitionOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  lang?: 'tr' | 'en';
}

type VoiceRecognitionResult = {
  isRecording: boolean;
  isInitializing: boolean;
  start: () => void;
  stop: () => void;
  hasSupport: boolean;
};
```

## Error Handling

### Error Categories

1. **Network Errors** (`network`)
   - Cause: Cannot connect to Google's speech servers
   - Solution: Check internet connection, verify CSP configuration
   - User Action: Ensure internet connectivity

2. **Permission Errors** (`not-allowed`, `service-not-allowed`)
   - Cause: Microphone permission denied
   - Solution: Grant microphone permissions
   - User Action: Allow microphone access in system settings

3. **Audio Errors** (`audio-capture`, `no-speech`)
   - Cause: Microphone unavailable or no speech detected
   - Solution: Check microphone hardware, speak clearly
   - User Action: Check microphone connection, try again

4. **Abort Errors** (`aborted`)
   - Cause: Recognition stopped unexpectedly
   - Solution: Restart recognition
   - User Action: Try again

### Error Recovery Strategy

```typescript
// Automatic retry logic for transient errors
const handleErrorWithRetry = (error: string) => {
  if (error === 'network' && retryCountRef.current < maxRetries) {
    retryCountRef.current++;
    console.log(`[useVoiceRecognition] Retrying... (${retryCountRef.current}/${maxRetries})`);
    
    setTimeout(() => {
      start();
    }, 1000 * retryCountRef.current); // Exponential backoff
  } else {
    // Max retries reached or non-retryable error
    onErrorRef.current?.(error);
  }
};
```

## Testing Strategy

### Manual Testing

1. **Basic Functionality Test**
   ```
   1. Build and run the Electron app
   2. Click the voice input button
   3. Verify no network errors in console
   4. Speak into microphone
   5. Verify real-time transcription appears
   ```

2. **Network Error Test**
   ```
   1. Disconnect internet
   2. Try to start voice recognition
   3. Verify appropriate error message
   4. Reconnect internet
   5. Verify recognition works again
   ```

3. **Permission Test**
   ```
   1. Deny microphone permission
   2. Try to start voice recognition
   3. Verify permission error message
   4. Grant permission
   5. Verify recognition works
   ```

### Console Log Verification

Expected console output for successful operation:

```
[SpeechManager] Web Speech API supported
[VoiceRecognitionUnified] Using Web Speech API
[useVoiceRecognition] Starting recognition...
[useVoiceRecognition] Language: tr
[useVoiceRecognition] Online status: true
[useVoiceRecognition] Recognition started successfully
[useVoiceRecognition] Interim result: "merhaba"
[useVoiceRecognition] Final result: "merhaba dünya"
```

Expected console output for network error (before fix):

```
[SpeechManager] Web Speech API supported
[VoiceRecognitionUnified] Using Web Speech API
[useVoiceRecognition] Starting recognition...
[useVoiceRecognition] Error: network
[useVoiceRecognition] Error Details: { type: 'network', timestamp: '...', isOnline: true, language: 'tr' }
Voice recognition error: network_fallback
```

### Automated Testing

While the spec focuses on implementation, future automated tests could include:

```typescript
// Example test structure (not implemented in this spec)
describe('Voice Recognition', () => {
  test('should initialize without network errors', async () => {
    // Mock Web Speech API
    // Verify no network errors
  });
  
  test('should handle network errors gracefully', async () => {
    // Mock network failure
    // Verify error handling
  });
});
```

## Security Considerations

### Changes Impact

1. **Removing `disable-background-networking`**
   - Risk: Allows background network requests
   - Mitigation: CSP still restricts which domains can be contacted
   - Impact: Low - only affects speech recognition domains

2. **Enabling Speech Features**
   - Risk: Enables additional Chromium features
   - Mitigation: Features are sandboxed and only used for speech
   - Impact: Low - standard browser feature

### Maintained Security

- Context isolation: ✅ Remains enabled
- Node integration: ✅ Remains disabled
- CSP: ✅ Remains restrictive (only allows necessary domains)
- Permissions: ✅ Remains controlled (auto-grant only for microphone)

### Production Recommendations

For production deployment:

1. **Monitor Network Traffic**
   - Log all speech API requests
   - Monitor for unexpected connections

2. **User Privacy**
   - Inform users that speech data is sent to Google
   - Provide option to disable voice input

3. **Fallback Strategy**
   - Consider implementing offline fallback (future enhancement)
   - Provide manual text input as alternative

## Performance Considerations

### Expected Improvements

1. **Latency**: Real-time transcription (< 500ms)
2. **Memory**: Low overhead (< 50MB)
3. **CPU**: Minimal usage (< 5%)

### Monitoring

Add performance logging:

```typescript
const performanceMetrics = {
  startTime: Date.now(),
  firstResultTime: null,
  finalResultTime: null,
};

// Log performance metrics
console.log('[Performance] Time to first result:', 
  performanceMetrics.firstResultTime - performanceMetrics.startTime, 'ms');
```

## Migration Path

### Step 1: Update Electron Configuration
- Modify `electron/main.cjs` command-line switches
- Test in development mode

### Step 2: Enhance Error Handling
- Update `hooks/useVoiceRecognition.ts` error handler
- Add detailed logging

### Step 3: Verify and Test
- Run manual tests
- Verify console logs
- Test in production build

### Step 4: Monitor
- Monitor for any new errors
- Collect user feedback
- Iterate if needed

## Future Enhancements

1. **Offline Fallback**: Implement local speech recognition for offline scenarios
2. **Language Detection**: Auto-detect user's language
3. **Custom Vocabulary**: Add domain-specific terms for better accuracy
4. **Performance Metrics**: Track and display recognition accuracy
5. **User Preferences**: Allow users to choose speech provider

## References

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Electron Command Line Switches](https://www.electronjs.org/docs/latest/api/command-line-switches)
- [Chromium Speech Recognition](https://www.chromium.org/developers/design-documents/speech-input/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
