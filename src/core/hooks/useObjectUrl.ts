import { useEffect, useState } from 'react';

/**
 * Returns a short-lived object URL for a `File` (e.g. to preview a freshly
 * selected image), creating it when the file changes and revoking it on cleanup
 * so the browser does not leak object URLs. Returns `null` when there is no file.
 */
export function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
