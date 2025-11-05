import React, { useState, useEffect, useRef } from 'react';

const SpeechTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Web Speech API not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'tr-TR'; // Turkish support
    
    recognition.onresult = (event: any) => {
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
      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }
    };
  }, []);

  const startRecording = () => {
    try {
      recognitionRef.current?.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  };

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } catch (e) {
      console.error('Failed to stop speech recognition:', e);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Web Speech API Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startRecording} 
          disabled={isRecording}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px', 
            backgroundColor: isRecording ? '#ccc' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isRecording ? 'not-allowed' : 'pointer'
          }}
        >
          Start Recording
        </button>
        <button 
          onClick={stopRecording} 
          disabled={!isRecording}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: !isRecording ? '#ccc' : '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: !isRecording ? 'not-allowed' : 'pointer'
          }}
        >
          Stop Recording
        </button>
      </div>
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        padding: '10px', 
        minHeight: '100px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
        <h3>Interim:</h3>
        <p style={{ color: '#666' }}>{interimTranscript}</p>
      </div>
    </div>
  );
};

export default SpeechTest;