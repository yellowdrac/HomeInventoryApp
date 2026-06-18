import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@/core/components/ui';
import { MicrophoneIcon, SendIcon, SparklesIcon } from '@/core/components/icons';
import { cn } from '@/core/lib/cn';
import { useSpeechRecognition, isSpeechRecognitionSupported } from '@/core/hooks/useSpeechRecognition';
import { useAssistantChat } from '@features/Assistant/hooks/useAssistantChat';
import { getAssistantErrorMessage } from '@features/Assistant/lib/assistantErrors';
import { ChatMessageBubble } from '@features/Assistant/components/ChatMessageBubble';
import { TypingIndicator } from '@features/Assistant/components/TypingIndicator';
import { AssistantEmptyState } from '@features/Assistant/components/AssistantEmptyState';
import type { ChatMessage } from '@features/Assistant/types';

/** How many recent turns to replay to the stateless backend. */
const MAX_HISTORY = 10;

const INPUT_ID = 'assistant-composer';

const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
};

export function AssistantView() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const chat = useAssistantChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Text that was in the textarea before the user started speaking — used to
  // prepend it to the live transcript so existing text is preserved.
  const baseTextRef = useRef('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const liveTranscriptRef = useRef('');

  const speechLang = SPEECH_LANG_MAP[i18n.language] ?? 'en-US';

  const handleTranscript = useCallback((text: string) => {
    liveTranscriptRef.current = text;
    setLiveTranscript(text);
  }, []);

  const { isListening, toggle, cancel } = useSpeechRecognition({
    lang: speechLang,
    onTranscript: handleTranscript,
    onEnd: () => {
      const transcript = liveTranscriptRef.current;
      if (transcript) {
        const base = baseTextRef.current;
        setInput(base ? `${base} ${transcript}` : transcript);
      }
      liveTranscriptRef.current = '';
      setLiveTranscript('');
      inputRef.current?.focus();
    },
  });

  function handleMicClick() {
    if (!isListening) {
      baseTextRef.current = input.trim();
      liveTranscriptRef.current = '';
      setLiveTranscript('');
    }
    toggle();
  }

  function handleCancelRecording() {
    cancel();
    liveTranscriptRef.current = '';
    setLiveTranscript('');
    baseTextRef.current = '';
  }

  // Keep the newest turn (and the typing indicator) in view.
  useEffect(() => {
    const el = logEndRef.current;
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch {
      // jsdom and some browsers may not implement scrollIntoView; ignore.
    }
  }, [messages, chat.isPending]);

  function send(messageOverride?: string) {
    const trimmed = (messageOverride ?? input).trim();
    if (!trimmed || chat.isPending) return;

    const history = messages
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    if (!messageOverride) setInput('');
    baseTextRef.current = '';
    chat.reset();

    chat.mutate(
      { message: trimmed, history },
      {
        onSuccess: (response) => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: response.answer,
              ...(response.references?.length ? { references: response.references } : {}),
              ...(response.proposedActions?.length
                ? { proposedActions: response.proposedActions }
                : {}),
              ...(response.clarificationQuestion
                ? { clarificationQuestion: response.clarificationQuestion }
                : {}),
            },
          ]);
        },
      },
    );
  }

  function handleStopRecording() {
    toggle(); // stops recognition → onEnd fires → transcript pasted to textarea
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isListening) {
      // Snapshot now, cancel recognition (skips onEnd), then send directly.
      const transcript = liveTranscriptRef.current;
      const base = baseTextRef.current;
      const fullText = transcript
        ? base
          ? `${base} ${transcript}`
          : transcript
        : base;
      cancel();
      liveTranscriptRef.current = '';
      setLiveTranscript('');
      baseTextRef.current = '';
      if (fullText.trim()) send(fullText.trim());
    } else {
      send();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  function pickExample(example: string) {
    setInput(example);
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <section className="flex h-[calc(100vh-9rem)] flex-col">
      <header className="space-y-1 pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <SparklesIcon className="size-7 text-emerald-500" />
          {t('assistant.title')}
        </h1>
        <p className="text-sm text-slate-600">{t('assistant.description')}</p>
      </header>

      <div
        role="log"
        aria-live="polite"
        aria-label={t('assistant.conversationLabel')}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        {isEmpty ? (
          <AssistantEmptyState onPick={pickExample} />
        ) : (
          messages.map((message, index) => (
            <ChatMessageBubble
              key={index}
              message={message}
              onClarificationSelect={send}
            />
          ))
        )}

        {chat.isPending ? <TypingIndicator /> : null}

        <div ref={logEndRef} />
      </div>

      {chat.isError ? (
        <Alert tone="error" className="mt-3">
          {getAssistantErrorMessage(chat.error)}
        </Alert>
      ) : null}

      {isListening ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-red-500">
              {t('assistant.live')}
            </span>
          </div>
          <p className="min-h-5 flex-1 text-sm leading-relaxed text-slate-700">
            {liveTranscript || (
              <span className="italic text-slate-400">{t('assistant.listening')}</span>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleStopRecording}
              className="rounded-md border border-red-300 bg-white px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              {t('assistant.stopRecording')}
            </button>
            <button
              type="button"
              onClick={handleCancelRecording}
              aria-label={t('assistant.cancelRecording')}
              className="text-slate-400 transition-colors hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor={INPUT_ID} className="sr-only">
            {t('assistant.inputLabel')}
          </label>
          <textarea
            id={INPUT_ID}
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              isListening
                ? t('assistant.listeningHint')
                : t('assistant.inputPlaceholder')
            }
            className={cn(
              'flex max-h-40 min-h-10 w-full resize-none rounded-lg border bg-white px-3 py-2',
              'text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400',
              'border-slate-300 focus-visible:border-emerald-600 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-emerald-600',
            )}
          />
        </div>

        {isSpeechRecognitionSupported ? (
          <div className="relative shrink-0">
            {isListening ? (
              <span
                className="absolute inset-0 rounded-lg border-2 border-red-400 animate-ping opacity-75"
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              onClick={handleMicClick}
              aria-label={isListening ? t('assistant.stopListening') : t('assistant.startListening')}
              aria-pressed={isListening}
              className={cn(
                'flex size-10 items-center justify-center rounded-lg border transition-all',
                isListening
                  ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                  : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700',
              )}
            >
              <MicrophoneIcon className="size-4" />
            </button>
          </div>
        ) : null}

        <Button
          type="submit"
          isLoading={chat.isPending}
          disabled={!isListening && input.trim() === ''}
          aria-label={t('assistant.sendLabel')}
        >
          {chat.isPending ? null : <SendIcon className="size-4" />}
          <span className="hidden sm:inline">{t('assistant.send')}</span>
        </Button>
      </form>
    </section>
  );
}
