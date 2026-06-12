/**
 * Client-side constraints for item photos. These mirror the backend
 * `ItemPhotoRules` (allowed content types + 5 MB max) so the UI can reject
 * obviously invalid files before spending a round-trip on the upload.
 */

/** Image content types the backend accepts for item photos. */
export const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Maximum accepted upload size, in bytes (5 MB), matching the backend. */
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

/** Maximum accepted upload size in whole megabytes, for user-facing copy. */
export const MAX_PHOTO_SIZE_MB = MAX_PHOTO_SIZE_BYTES / (1024 * 1024);

/** Human-readable list of the accepted formats, used in messages and the hint. */
export const ALLOWED_PHOTO_LABEL = 'JPEG, PNG or WebP';

/**
 * Validates a candidate item photo against the type and size constraints.
 * Returns a user-facing error message when the file is unacceptable, or
 * `null` when it is valid and safe to upload.
 */
export function validatePhotoFile(file: File): string | null {
  if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return `Unsupported image type. Use ${ALLOWED_PHOTO_LABEL}.`;
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return `Image is too large. The maximum size is ${MAX_PHOTO_SIZE_MB} MB.`;
  }

  return null;
}
