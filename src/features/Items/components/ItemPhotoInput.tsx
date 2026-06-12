import { useState, type DragEvent } from 'react';
import { cn } from '@/core/lib/cn';
import { ImageIcon, UploadIcon } from '@/core/components/icons';
import {
  ALLOWED_PHOTO_LABEL,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_MB,
  validatePhotoFile,
} from '@features/Items/lib/photo';

interface ItemPhotoInputProps {
  /** Unique id tying the visible drop zone to its file input. */
  id: string;
  /** Image to show: a staged preview or an existing photo URL; null shows a placeholder. */
  previewUrl: string | null;
  /** Called with a file that passed client-side validation. */
  onSelect: (file: File) => void;
  /** External error to display (e.g. a failed upload), shown when there is no validation error. */
  error?: string | null;
  disabled?: boolean;
}

/**
 * Accessible photo picker: a keyboard-operable drag-and-drop zone backed by a
 * file input, with a live preview and inline validation. Files are validated
 * (type/size) before `onSelect` fires, so invalid files never leave the client.
 * Reused by the create/edit flows and the item detail photo manager.
 */
export function ItemPhotoInput({
  id,
  previewUrl,
  onSelect,
  error,
  disabled = false,
}: ItemPhotoInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const shownError = validationError ?? error ?? null;

  function handleFile(file: File | undefined | null) {
    if (!file) {
      return;
    }
    const message = validatePhotoFile(file);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError(null);
    onSelect(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFile(event.dataTransfer.files?.[0]);
    }
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
          isDragging
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-300 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Item photo preview"
            className="max-h-40 w-auto rounded-lg object-contain"
          />
        ) : (
          <span
            className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400"
            aria-hidden="true"
          >
            <ImageIcon className="size-6" />
          </span>
        )}

        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
          <UploadIcon className="size-4" aria-hidden="true" />
          {previewUrl ? 'Change photo' : 'Upload a photo'}
        </span>
        <span id={hintId} className="text-xs text-slate-500">
          {ALLOWED_PHOTO_LABEL}, up to {MAX_PHOTO_SIZE_MB} MB
        </span>

        <input
          id={id}
          type="file"
          accept={ALLOWED_PHOTO_TYPES.join(',')}
          className="sr-only"
          disabled={disabled}
          aria-describedby={shownError ? `${hintId} ${errorId}` : hintId}
          aria-invalid={shownError ? true : undefined}
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            // Reset so picking the same file again re-triggers change.
            event.target.value = '';
          }}
        />
      </label>

      {shownError ? (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
