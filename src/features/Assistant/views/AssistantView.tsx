import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Alert, Button } from '@/core/components/ui';
import { SendIcon, SparklesIcon } from '@/core/components/icons';
import { cn } from '@/core/lib/cn';
import { useAssistantChat } from '@features/Assistant/hooks/useAssistantChat';
import { getAssistantErrorMessage } from '@features/Assistant/lib/assistantErrors';
import { ChatMessageBubble } from '@features/Assistant/components/ChatMessageBubble';
import { TypingIndicator } from '@features/Assistant/components/TypingIndicator';
import { AssistantEmptyState } from '@features/Assistant/components/AssistantEmptyState';
import type { ChatMessage } from '@features/Assistant/types';

/** How many recent turns to replay to the stateless backend. */
const MAX_HISTORY = 10;

const INPUT_ID = 'assistant-composer';

/**
 * Assistant chat: a ChatGPT-style conversation over the household inventory.
 * History is kept on the client and replayed with each request (the backend is
 * stateless). The assistant can propose write actions (create items/locations,
 * add/move stock) which the user must confirm before anything is mutated.
 */
export function AssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const chat = useAssistantChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

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
    if (!trimmed || chat.isPending) {
      return;
    }

    const history = messages
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    if (!messageOverride) setInput('');
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
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
          Assistant
        </h1>
        <p className="text-sm text-slate-600">
          Ask about your inventory or tell the assistant to add stock, move items, and more.
        </p>
      </header>

      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
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

      <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor={INPUT_ID} className="sr-only">
            Ask the assistant
          </label>
          <textarea
            id={INPUT_ID}
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about your inventory…"
            className={cn(
              'flex max-h-40 min-h-10 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2',
              'text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400',
              'focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600',
            )}
          />
        </div>
        <Button
          type="submit"
          isLoading={chat.isPending}
          disabled={input.trim() === ''}
          aria-label="Send message"
        >
          {chat.isPending ? null : <SendIcon className="size-4" />}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </section>
  );
}
