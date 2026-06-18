import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ??
    (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ??
    null
  );
}

export const isSpeechRecognitionSupported = getSpeechRecognitionCtor() !== null;

interface UseSpeechRecognitionOptions {
  /** BCP-47 language tag, e.g. "en-US" or "es-ES". */
  lang: string;
  /** Called on every result update — both interim and final. */
  onTranscript: (text: string) => void;
  /** Called when recognition ends (silence or explicit stop). */
  onEnd?: () => void;
}

export function useSpeechRecognition({
  lang,
  onTranscript,
  onEnd,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const cancelledRef = useRef(false);

  // Keep callbacks in refs so the recognition instance doesn't need to be
  // recreated when they change.
  const onTranscriptRef = useRef(onTranscript);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onTranscriptRef.current = onTranscript; });
  useEffect(() => { onEndRef.current = onEnd; });

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    recognitionRef.current?.abort();
  }, []);

  const start = useCallback(() => {
    const SR = getSpeechRecognitionCtor();
    if (!SR) return;

    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i]![0]!.transcript;
      }
      onTranscriptRef.current(text);
    };

    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (!cancelledRef.current) {
        onEndRef.current?.();
      }
      cancelledRef.current = false;
    };

    rec.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      cancelledRef.current = false;
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [lang]);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  return { isListening, isSupported: isSpeechRecognitionSupported, toggle, cancel };
}
