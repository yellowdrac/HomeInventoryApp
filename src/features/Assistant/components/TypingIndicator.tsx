import { useTranslation } from 'react-i18next';
import { SparklesIcon } from '@/core/components/icons';

/**
 * "Assistant is typing" placeholder shown while an answer is in flight. The
 * animated dots are decorative; the visible label carries the meaning for
 * assistive tech (the chat log announces it politely).
 */
export function TypingIndicator() {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2.5" role="status">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600"
      >
        <SparklesIcon className="size-4" />
      </span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="flex gap-1" aria-hidden="true">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </span>
        <span className="text-sm text-slate-500">{t('assistant.typing')}</span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  );
}
