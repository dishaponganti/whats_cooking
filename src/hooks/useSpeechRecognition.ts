import { useState, useEffect } from 'react';
import Voice from 'react-native-voice';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().catch(() => {});
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechRecognized = () => {
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechError = (error: any) => {
    setError(error?.error?.message || 'Speech recognition error');
    setIsListening(false);
  };

  const onSpeechResults = (result: any) => {
    if (result.value && result.value.length > 0) {
      setTranscript(result.value[0]);
    }
  };

  const startListening = async (): Promise<void> => {
    try {
      setError(null);
      await Voice.start('hi-IN'); // Hindi India
    } catch (err: any) {
      setError(err?.message || 'Failed to start listening');
    }
  };

  const stopListening = async (): Promise<void> => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to stop listening');
    }
  };

  const resetTranscript = (): void => {
    setTranscript('');
    setError(null);
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
