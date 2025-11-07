import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { MicIcon, StopIcon, SendIcon, CloseIcon } from './icons/Icons';

interface VoiceInputModalProps {
  interimTranscript: string;
  finalTranscript: string;
  isRecording: boolean;
  isInitializing: boolean;
  isTranscribing?: boolean;
  onToggleRecording: () => void;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  interimTranscript,
  finalTranscript,
  isRecording,
  isInitializing,
  isTranscribing = false,
  onToggleRecording,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslations();
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    if (isInitializing) {
      setStatus('processing');
    } else if (isRecording) {
      setStatus('listening');
    } else if (status === 'listening' && !isRecording && !finalTranscript) {
      // Recording was stopped before any final transcript was received
      setStatus('idle');
    } else if (status === 'listening' && !isRecording && finalTranscript) {
      // Recording stopped, and we have a transcript to process/show
      setStatus('idle');
    }
  }, [isRecording, isInitializing, finalTranscript, status]);


  const displayText = editedText || finalTranscript + (interimTranscript ? ' ' + interimTranscript : '');

  const handleSubmit = () => {
    const textToSubmit = editedText || finalTranscript;
    if (textToSubmit.trim()) {
      onSubmit(textToSubmit);
    }
    onClose();
  };

  const getStatusText = () => {
    if (isTranscribing) {
      return t('voice.transcribing') || 'Transkripsiyon yapılıyor...';
    }
    switch (status) {
      case 'listening':
        return t('voice.listening') || 'Dinleniyor...';
      case 'processing':
        return t('voice.processing') || 'İşleniyor...';
      default:
        return t('voice.readyToRecord') || 'Kayıt için hazır';
    }
  };

  // Model durumu göstergesi
  const ModelStatusIndicator = () => (
    <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
      <div className={`w-2 h-2 rounded-full ${
        !isInitializing && !isRecording ? 'bg-green-500' : 
        isInitializing ? 'bg-yellow-500 animate-pulse' : 
        'bg-blue-500 animate-pulse'
      }`} />
      <span>
        {isInitializing ? 'Model yükleniyor...' : 
         isRecording ? 'Aktif' : 'Hazır'}
      </span>
    </div>
  );
  
  const handleToggle = () => {
    if (isRecording) {
        setStatus('processing');
    }
    onToggleRecording();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-background-secondary rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4 flex flex-col items-center gap-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-text-secondary hover:bg-border"
          aria-label={t('common.close')}
        >
          <CloseIcon width="20" height="20" />
        </button>

        <div className="w-full text-center">
          <ModelStatusIndicator />
          <p className="text-lg font-semibold text-text-primary mb-2">{getStatusText()}</p>
          <textarea
            value={editedText || (finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''))}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-28 min-h-[100px] p-4 bg-background rounded-lg border border-border text-text-primary text-lg overflow-y-auto resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Transkript burada görünecek..."
          />
        </div>

        <div className="flex items-center justify-center gap-6 w-full">
          <div className="flex-grow"></div>
          <button
            onClick={handleToggle}
            disabled={isInitializing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg animate-pulse-voice'
                : 'bg-primary text-primary-text'
            } disabled:opacity-50`}
            aria-label={isRecording ? t('voice.stop') : t('voice.start')}
          >
            {isRecording ? <StopIcon width="32" height="32" /> : <MicIcon width="32" height="32" />}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!finalTranscript.trim() || isRecording || isInitializing}
            className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('voice.insert')}
          >
            <SendIcon width="24" height="24" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInputModal;
