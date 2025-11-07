#!/usr/bin/env python3
"""
Whisper Speech-to-Text Server for Neural Pad
Runs as a background process and transcribes audio via stdin/stdout
"""

import sys
import json
import whisper
import numpy as np
import io
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

def load_model(model_size="base"):
    """Load Whisper model"""
    try:
        sys.stdout.write(json.dumps({"status": "loading", "model": model_size}) + "\n")
        sys.stdout.flush()
        
        # Redirect model loading output to stderr
        import os
        old_stdout = sys.stdout
        sys.stdout = sys.stderr
        
        model = whisper.load_model(model_size)
        
        # Restore stdout
        sys.stdout = old_stdout
        
        sys.stdout.write(json.dumps({"status": "ready", "model": model_size}) + "\n")
        sys.stdout.flush()
        return model
    except Exception as e:
        sys.stdout.write(json.dumps({"status": "error", "message": str(e)}) + "\n")
        sys.stdout.flush()
        sys.exit(1)

def transcribe_audio(model, audio_data, language="tr"):
    """Transcribe audio data"""
    try:
        import time
        start_time = time.time()
        
        # Convert bytes to numpy array
        audio_array = np.frombuffer(audio_data, dtype=np.float32)
        sys.stderr.write(f"[Whisper Python] Audio array size: {len(audio_array)} samples\n")
        sys.stderr.flush()
        
        # Check minimum audio length (at least 0.3 seconds at 16kHz = 4800 samples)
        min_samples = 4800
        if len(audio_array) < min_samples:
            sys.stderr.write(f"[Whisper Python] Audio too short: {len(audio_array)} < {min_samples}\n")
            sys.stderr.flush()
            return {"status": "success", "text": "", "language": language}
        
        # Normalize audio to [-1, 1] range
        max_val = np.abs(audio_array).max()
        if max_val > 1.0:
            audio_array = audio_array / max_val
            sys.stderr.write(f"[Whisper Python] Normalized audio from max={max_val}\n")
            sys.stderr.flush()
        
        # Ensure audio is not empty and has valid values
        if len(audio_array) == 0:
            return {"status": "success", "text": "", "language": language}
        
        if np.isnan(audio_array).any() or np.isinf(audio_array).any():
            return {"status": "error", "message": "Invalid audio data (NaN or Inf)"}
        
        # Check if audio has sufficient energy (not just silence)
        audio_energy = np.sqrt(np.mean(audio_array ** 2))
        sys.stderr.write(f"[Whisper Python] Audio energy: {audio_energy}\n")
        sys.stderr.flush()
        
        if audio_energy < 0.001:  # Very quiet audio
            sys.stderr.write("[Whisper Python] Audio too quiet, skipping\n")
            sys.stderr.flush()
            return {"status": "success", "text": "", "language": language}
        
        # Pad to at least 1 second of audio (16000 samples at 16kHz)
        min_length = 16000
        if len(audio_array) < min_length:
            audio_array = np.pad(audio_array, (0, min_length - len(audio_array)))
        
        sys.stderr.write("[Whisper Python] Starting Whisper transcription...\n")
        sys.stderr.flush()
        
        # Transcribe with accuracy-optimized settings
        result = model.transcribe(
            audio_array, 
            language=language, 
            fp16=False,
            # Accuracy improvements
            beam_size=5,  # Default is 5, higher = more accurate but slower
            best_of=5,    # Number of candidates to consider
            temperature=0.0,  # Deterministic output (no randomness)
            # Context and prompting
            condition_on_previous_text=False,  # Keep False for independent segments
            initial_prompt=None,  # Could add Turkish-specific context here
            # Silence detection
            no_speech_threshold=0.6,
            logprob_threshold=-1.0,  # Default threshold
            compression_ratio_threshold=2.4,  # Default threshold
            # Output control
            verbose=False,
            word_timestamps=False  # Faster without word-level timestamps
        )
        
        elapsed = time.time() - start_time
        sys.stderr.write(f"[Whisper Python] Transcription took {elapsed:.2f}s\n")
        sys.stderr.flush()
        
        return {
            "status": "success",
            "text": result["text"].strip(),
            "language": result.get("language", language)
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        sys.stderr.write(f"[Whisper Python] Exception: {error_details}\n")
        sys.stderr.flush()
        return {
            "status": "error",
            "message": str(e)
        }

def main():
    """Main server loop"""
    model_size = sys.argv[1] if len(sys.argv) > 1 else "base"
    model = load_model(model_size)
    
    sys.stdout.write(json.dumps({"status": "listening"}) + "\n")
    sys.stdout.flush()
    
    while True:
        try:
            # Read command from stdin
            line = sys.stdin.readline()
            if not line:
                sys.stderr.write("[Whisper Python] EOF received, exiting\n")
                sys.stderr.flush()
                break
            
            # Skip empty lines
            line = line.strip()
            if not line:
                sys.stderr.write("[Whisper Python] Empty line received, skipping\n")
                sys.stderr.flush()
                continue
            
            # Log raw input for debugging
            sys.stderr.write(f"[Whisper Python] Received command: {line[:100]}\n")
            sys.stderr.flush()
            
            try:
                command = json.loads(line)
            except json.JSONDecodeError as e:
                error_msg = f"JSON decode error: {str(e)}, input: {line[:50]}"
                sys.stderr.write(f"[Whisper Python] {error_msg}\n")
                sys.stderr.flush()
                sys.stdout.write(json.dumps({"status": "error", "message": error_msg}) + "\n")
                sys.stdout.flush()
                continue
            
            if command["action"] == "transcribe":
                # Read audio data length
                audio_length = command["length"]
                language = command.get("language", "tr")
                
                # Log transcription start
                sys.stderr.write(f"[Whisper Python] Starting transcription: {audio_length} bytes, lang={language}\n")
                sys.stderr.flush()
                
                # Read exact amount of audio data from stdin.buffer
                audio_data = b''
                remaining = audio_length
                
                while remaining > 0:
                    chunk = sys.stdin.buffer.read(remaining)
                    if not chunk:
                        sys.stderr.write(f"[Whisper Python] EOF while reading audio data, got {len(audio_data)}/{audio_length} bytes\n")
                        sys.stderr.flush()
                        break
                    audio_data += chunk
                    remaining -= len(chunk)
                
                # Verify we read the correct amount
                if len(audio_data) != audio_length:
                    error_msg = f"Expected {audio_length} bytes, got {len(audio_data)}"
                    sys.stderr.write(f"[Whisper Python] Error: {error_msg}\n")
                    sys.stderr.flush()
                    sys.stdout.write(json.dumps({"status": "error", "message": error_msg}) + "\n")
                    sys.stdout.flush()
                    continue
                
                # Transcribe
                result = transcribe_audio(model, audio_data, language)
                
                # Log result
                sys.stderr.write(f"[Whisper Python] Transcription complete: '{result.get('text', '')}'\n")
                sys.stderr.flush()
                
                sys.stdout.write(json.dumps(result) + "\n")
                sys.stdout.flush()
                
            elif command["action"] == "ping":
                sys.stdout.write(json.dumps({"status": "pong"}) + "\n")
                sys.stdout.flush()
                
            elif command["action"] == "exit":
                sys.stderr.write("[Whisper Python] Exit command received\n")
                sys.stderr.flush()
                break
                
        except Exception as e:
            import traceback
            error_msg = f"Unexpected error: {str(e)}"
            error_details = traceback.format_exc()
            sys.stderr.write(f"[Whisper Python] {error_msg}\n{error_details}\n")
            sys.stderr.flush()
            sys.stdout.write(json.dumps({"status": "error", "message": error_msg}) + "\n")
            sys.stdout.flush()
    
    sys.stdout.write(json.dumps({"status": "shutdown"}) + "\n")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
