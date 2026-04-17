"use client";

import { useEffect, useState } from "react";

export function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (
    text: string,
    voiceName?: string,
    onEnd?: () => void
  ) => {
    if (!text) return;

    // 🛑 interrupt previous speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice =
      voices.find((v) => v.name.includes(voiceName || "")) ||
      voices[0];

    if (voice) utterance.voice = voice;

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking, voices };
}
