import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecognitionOptions {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (error: any) => void;
}

export const useVoiceRecognition = (options: VoiceRecognitionOptions) => {
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const onResultRef = useRef(options.onResult);
    const onErrorRef = useRef(options.onError);

    useEffect(() => {
        onResultRef.current = options.onResult;
        onErrorRef.current = options.onError;
    }, [options.onResult, options.onError]);

    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        const rec = new SR();
        recognitionRef.current = rec;

        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'tr-TR';

        rec.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            if (final) onResultRef.current(final, true);
            if (interim) onResultRef.current(interim, false);
        };

        rec.onerror = (event: any) => {
            if (onErrorRef.current) onErrorRef.current(event.error);
        };

        return () => {
            if (rec) {
                try { rec.stop(); } catch(e) {}
            }
        };
    }, []);

    const start = useCallback(() => {
        if (recognitionRef.current && !isRecording) {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch(e) {
                console.error('Failed to start recording:', e);
            }
        }
    }, [isRecording]);

    const stop = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            try {
                recognitionRef.current.stop();
                setIsRecording(false);
            } catch(e) {
                console.error('Failed to stop recording:', e);
            }
        }
    }, [isRecording]);

    return { isRecording, start, stop };
};