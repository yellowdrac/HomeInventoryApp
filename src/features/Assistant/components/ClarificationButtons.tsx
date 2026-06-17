import type { ClarificationQuestion } from '@features/Assistant/types';

interface ClarificationButtonsProps {
  question: ClarificationQuestion;
  onSelect: (option: string) => void;
}

/**
 * Renders a disambiguation question as quick-reply buttons. Clicking an option
 * sends that option as the next user message without requiring the user to type.
 */
export function ClarificationButtons({ question, onSelect }: ClarificationButtonsProps) {
  return (
    <div className="mt-3" role="group" aria-label={question.text}>
      <p className="mb-2 text-xs text-slate-500">{question.text}</p>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            aria-label={`Select: ${option}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
