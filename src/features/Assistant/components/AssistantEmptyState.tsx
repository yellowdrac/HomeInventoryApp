import { SparklesIcon } from '@/core/components/icons';

/** Example prompts in both supported languages; clicking one fills the input. */
const EXAMPLES = [
  '¿Dónde están mis pilas?',
  "What's expiring soon?",
  '¿Cuánto café tengo?',
] as const;

interface AssistantEmptyStateProps {
  /** Called with the chosen example so the parent can prefill the input. */
  onPick: (example: string) => void;
}

/**
 * Shown before the first message: a short intro plus clickable example prompts
 * that prefill the composer. Helps users discover what they can ask.
 */
export function AssistantEmptyState({ onPick }: AssistantEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <SparklesIcon className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Ask about your inventory
        </h2>
        <p className="max-w-md text-sm text-slate-600">
          Find where things are and how much stock you have. Ask in English or
          Spanish.
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <button
              type="button"
              onClick={() => onPick(example)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
