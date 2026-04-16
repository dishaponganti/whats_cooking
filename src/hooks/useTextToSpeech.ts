import { useState } from 'react';
import * as Speech from 'expo-speech';

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = async (text: string): Promise<void> => {
    // Stop any existing speech
    await Speech.stop();
    
    setIsSpeaking(true);
    try {
      await Speech.speak(text, {
        language: 'hi', // Hindi language code
        rate: 0.9,
        pitch: 1.0,
      });
    } catch (error) {
      console.warn('Speech failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stop = async (): Promise<void> => {
    await Speech.stop();
    setIsSpeaking(false);
  };

  return { isSpeaking, speak, stop };
}
