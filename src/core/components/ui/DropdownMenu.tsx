import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/core/lib/cn';

export interface DropdownMenuItem {
  /** Stable key/label for the item. */
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  onSelect: () => void;
  /** `danger` renders the item in a destructive color. */
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  /** Accessible label for the trigger button. */
  triggerLabel: string;
  /** Trigger button content (typically an icon). */
  trigger: ReactNode;
  items: DropdownMenuItem[];
  /** Extra classes for the trigger button. */
  className?: string;
}

/**
 * Accessible menu button following the WAI-ARIA menu pattern: the trigger wires
 * `aria-haspopup`/`aria-expanded`, the list uses `role="menu"` with
 * `role="menuitem"` children, arrow keys move focus, Enter/Space activate, and
 * Escape or an outside click closes and returns focus to the trigger.
 */
export function DropdownMenu({
  triggerLabel,
  trigger,
  items,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  function openMenu(initialIndex: number) {
    setActiveIndex(initialIndex);
    setOpen(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu(0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(items.length - 1);
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function selectItem(item: DropdownMenuItem) {
    if (item.disabled) {
      return;
    }
    close(false);
    item.onSelect();
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close() : openMenu(0))}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex size-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600',
          className,
        )}
      >
        {trigger}
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-20 mt-1 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {items.map((item, index) => (
            <li key={item.label} role="none">
              <button
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={index === activeIndex ? 0 : -1}
                disabled={item.disabled}
                onClick={() => selectItem(item)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                  item.tone === 'danger'
                    ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
