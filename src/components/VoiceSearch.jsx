import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './VoiceSearch.css';

const VoiceSearch = ({ onResult, onStateChange }) => {
  const { lang, isRtl } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const isArabic = lang === 'ar';
  const t = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = isArabic ? 'ar-SA' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        if (onStateChange) onStateChange(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
        setIsListening(false);
        if (onStateChange) onStateChange(false);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (onStateChange) onStateChange(false);
      };

      rec.onend = () => {
        setIsListening(false);
        if (onStateChange) onStateChange(false);
      };

      setRecognition(rec);
    }
  }, [lang, isArabic, onResult, onStateChange]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      try {
        recognition?.start();
      } catch (e) {
        console.error('Speech recognition start failed', e);
      }
    }
  };

  if (!recognition) return null;

  return (
    <div className={`voice-search-container ${isListening ? 'active' : ''}`}>
      <button
        type="button"
        className="voice-search-btn"
        onClick={toggleListening}
        title={t('Voice Search', 'البحث الصوتي')}
      >
        <svg viewBox="0 0 24 24" className="mic-icon">
          <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
      {isListening && (
        <div className="voice-status-overlay">
          <div className="voice-status-content">
            <div className="pulse-ring"></div>
            <p>{t('Listening...', 'جاري الاستماع...')}</p>
            <small>{t('Try saying "Ceramic Vase"', 'جرب قول "فازة سيراميك"')}</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
