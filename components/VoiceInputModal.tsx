import React, { useState } from 'react';
import { MicIcon, StopIcon, SendIcon } from './icons/Icons';

interface VoiceInputModalProps {
  interimTranscript: string;
  finalTranscript: string;
  isRecording: boolean;
  onToggleRecording: () => void;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ 
  interimTranscript, 
  finalTranscript,
  isRecording, 
  onToggleRecording, 
  onSubmit,
  onClose 
}) => {
  const [editedText, setEditedText] = useState('');
  
  const displayText = editedText || finalTranscript + (interimTranscript ? ' ' + interimTranscript : '');
  
  const handleSubmit = () => {
    const textToSubmit = editedText || finalTranscript;
    if (textToSubmit.trim()) {
      onSubmit(textToSubmit);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg p-8 shadow-xl max-w-2xl w-full mx-4 flex flex-col items-center gap-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Sesli Giriş
        </h3>
        <textarea
          value={displayText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full min-h-[180px] p-4 bg-background rounded border border-border-strong text-text-primary text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Metin burada görünecek..."
        />
        <div className="w-full flex gap-2">
          <button
            onClick={onToggleRecording}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-primary hover:bg-primary-hover text-primary-text'
            }`}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
            {isRecording ? 'Durdur' : 'Kaydet'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!displayText.trim()}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <SendIcon />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInputModal;
