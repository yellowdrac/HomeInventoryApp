import { cn } from '@/core/lib/cn';
import { SparklesIcon, UserIcon } from '@/core/components/icons';
import { Markdown } from '@features/Assistant/components/Markdown';
import { ReferenceLinks } from '@features/Assistant/components/ReferenceLinks';
import type { ChatMessage } from '@features/Assistant/types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

/**
 * A single chat turn. User turns are plain text in an emerald bubble aligned to
 * the right; assistant turns render safe markdown in a white card on the left,
 * followed by any cited items/locations as links.
 */
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600',
        )}
      >
        {isUser ? (
          <UserIcon className="size-4" />
        ) : (
          <SparklesIcon className="size-4" />
        )}
      </span>

      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[75%]',
          isUser
            ? 'bg-emerald-600 text-white'
            : 'border border-slate-200 bg-white text-slate-800',
        )}
      >
        <span className="sr-only">
          {isUser ? 'You said:' : 'Assistant said:'}
        </span>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        ) : (
          <>
            <Markdown content={message.content} />
            {message.references && message.references.length > 0 ? (
              <ReferenceLinks references={message.references} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
