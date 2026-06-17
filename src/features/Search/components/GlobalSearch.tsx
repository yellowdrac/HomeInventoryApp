import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Dialog } from '@/core/components/ui';
import { cn } from '@/core/lib/cn';
import { MapPinIcon, PackageIcon, SearchIcon } from '@/core/components/icons';
import {
  MIN_SEARCH_LENGTH,
  useSearch,
} from '@features/Search/hooks/useSearch';
import { getSearchErrorMessage } from '@features/Search/lib/searchErrors';
import type { SearchResultItem } from '@features/Search/types';

/** Max quick matches shown in the palette before "search everywhere". */
const QUICK_LIMIT = 6;

// Prevents the Ctrl+K shortcut from being registered by more than one
// mounted GlobalSearch instance (sidebar + mobile top bar are both mounted).
let shortcutOwned = false;

interface GlobalSearchProps {
  /** Render as a compact icon-only button (for the desktop sidebar). */
  compact?: boolean;
}

/**
 * Global search access: a button that opens an accessible command palette for
 * quick "where is it?" lookups with keyboard navigation. Also opens on
 * Ctrl/Cmd+K. Pass `compact` to render as an icon-only button for tight spaces.
 */
export function GlobalSearch({ compact = false }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only the first mounted instance registers the keyboard shortcut.
    if (shortcutOwned) return;
    shortcutOwned = true;

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      shortcutOwned = false;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search inventory"
        className={
          compact
            ? 'flex size-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600'
            : 'flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600'
        }
      >
        <SearchIcon className="size-4 shrink-0" />
        {!compact && (
          <>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 text-xs font-medium text-slate-400 sm:inline">
              Ctrl K
            </kbd>
          </>
        )}
      </button>

      {open ? <SearchPalette onClose={() => setOpen(false)} /> : null}
    </>
  );
}

interface SearchPaletteProps {
  onClose: () => void;
}

type PaletteOption =
  | { kind: 'item'; result: SearchResultItem }
  | { kind: 'all' };

function SearchPalette({ onClose }: SearchPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const optionIdBase = useId();

  const { data, isError, error, isFetching, isEnabled, debouncedQuery } =
    useSearch(query);

  const results = useMemo(
    () => (data?.items ?? []).slice(0, QUICK_LIMIT),
    [data],
  );

  const trimmed = query.trim();
  const options = useMemo<PaletteOption[]>(() => {
    const items: PaletteOption[] = results.map((result) => ({
      kind: 'item',
      result,
    }));
    if (trimmed.length >= MIN_SEARCH_LENGTH) {
      items.push({ kind: 'all' });
    }
    return items;
  }, [results, trimmed]);

  // Keep the active option in range as the option set changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, options.length]);

  const optionId = (index: number) => `${optionIdBase}-${index}`;

  function selectOption(option: PaletteOption | undefined) {
    if (!option) {
      return;
    }
    if (option.kind === 'item') {
      navigate(`/items/${option.result.itemId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    onClose();
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (options.length === 0) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
        event.preventDefault();
        selectOption(options[activeIndex]);
        break;
      default:
        break;
    }
  }

  const showHint = trimmed.length < MIN_SEARCH_LENGTH;
  const showLoading = isEnabled && isFetching && !data;
  const showNoResults =
    isEnabled && !isError && !isFetching && results.length === 0;

  return (
    <Dialog
      open
      onClose={onClose}
      title="Search inventory"
      description="Find where an item is stored, or open the full results."
      initialFocusRef={inputRef}
    >
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={
              options.length > 0 ? optionId(activeIndex) : undefined
            }
            aria-autocomplete="list"
            aria-label="Search inventory"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search for an item"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          />
        </div>

        {isError ? (
          <Alert tone="error">{getSearchErrorMessage(error)}</Alert>
        ) : null}

        {showHint ? (
          <p className="px-1 py-3 text-sm text-slate-500">
            Type at least {MIN_SEARCH_LENGTH} characters to search.
          </p>
        ) : null}

        {showLoading ? (
          <p className="px-1 py-3 text-sm text-slate-500" role="status">
            Searching...
          </p>
        ) : null}

        {showNoResults ? (
          <p className="px-1 pt-3 text-sm text-slate-500" role="status">
            No matches. Press Enter to search everywhere.
          </p>
        ) : null}

        {options.length > 0 ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="max-h-72 space-y-1 overflow-y-auto"
          >
            {options.map((option, index) => (
              <li
                key={option.kind === 'item' ? option.result.itemId : 'all'}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm',
                  index === activeIndex ? 'bg-emerald-50' : 'hover:bg-slate-100',
                )}
              >
                {option.kind === 'item' ? (
                  <ItemOption result={option.result} />
                ) : (
                  <span className="flex items-center gap-2 font-medium text-emerald-700">
                    <SearchIcon className="size-4" />
                    Search everywhere for &ldquo;{trimmed}&rdquo;
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Dialog>
  );
}

/** A single quick-match row: item name plus its primary location path. */
function ItemOption({ result }: { result: SearchResultItem }) {
  const primary = result.placements[0];
  const path = primary?.breadcrumb.map((entry) => entry.name).join(' › ');

  return (
    <>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
        aria-hidden="true"
      >
        <PackageIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-slate-900">
          {result.name}
        </span>
        {path ? (
          <span className="flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPinIcon className="size-3.5 shrink-0" />
            {path}
          </span>
        ) : (
          <span className="block truncate text-xs text-slate-400">
            Not stored anywhere yet
          </span>
        )}
      </span>
    </>
  );
}
