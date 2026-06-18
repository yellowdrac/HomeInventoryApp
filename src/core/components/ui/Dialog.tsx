import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/core/lib/cn';
import { XIcon } from '@/core/components/icons';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional footer (typically the action buttons). */
  footer?: ReactNode;
  /**
   * ARIA role for the surface. Use `alertdialog` for destructive confirmations
   * so assistive tech treats it as an interruption that needs a response.
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * Element to focus when the dialog opens. Defaults to the first focusable
   * element; pass this to focus a specific control (e.g. a search input).
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), ' +
  'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * Accessible modal dialog. Renders into a portal with a backdrop, labels itself
 * via `aria-labelledby`/`aria-describedby`, traps Tab focus inside, closes on
 * Escape or backdrop click, and restores focus to the trigger on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  role = 'dialog',
  initialFocusRef,
}: DialogProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const surface = surfaceRef.current;
    // Move focus into the dialog: a caller-specified element if given, else the
    // first focusable, else the surface itself.
    const focusables = surface ? getFocusable(surface) : [];
    (initialFocusRef?.current ?? focusables[0] ?? surface)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !surface) {
        return;
      }
      const items = getFocusable(surface);
      if (items.length === 0) {
        event.preventDefault();
        surface.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === surface)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={surfaceRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-xl',
          'max-h-[calc(100vh-2rem)]',
          'focus-visible:outline-none',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <XIcon className="size-5" />
        </button>

        {/* Header — never scrolls */}
        <div className="flex-none space-y-1 px-6 pb-0 pr-14 pt-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-sm text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        {/* Body — scrolls when content overflows */}
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>

        {footer ? (
          <div className="flex-none border-t border-slate-100 px-6 pb-6 pt-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
