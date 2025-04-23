
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  isDisabled?: boolean;
}

const VoiceInput = ({ onResult, isDisabled = false }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsLoading(true);
    
    // Create speech recognition instance
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      console.error('Speech recognition not supported');
      setIsLoading(false);
      return;
    }
    
    const recognition = new SpeechRecognitionConstructor();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setIsLoading(false);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      stopListening();
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setIsLoading(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setIsLoading(false);
    };
    
    // Start listening
    recognition.start();

    // Save the recognition instance
    window.currentRecognition = recognition;
  };

  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setIsListening(false);
  };

  if (!isSupported) {
    return null; // Don't render if speech recognition is not supported
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleListening}
      disabled={isDisabled || isLoading}
      className={`relative ${isListening ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-health-500 hover:bg-health-50'}`}
      title={isListening ? "Stop listening" : "Speak your message"}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </Button>
  );
};

export default VoiceInput;
