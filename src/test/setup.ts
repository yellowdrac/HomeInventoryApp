// Extends Vitest's `expect` with the jest-dom matchers (toBeInTheDocument, ...)
// and clears the DOM between tests.
import '@testing-library/jest-dom/vitest';
// Initialize i18next so t() returns English strings instead of raw keys.
import '@/i18n';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement object URLs; stub them so components that preview a
// selected File (URL.createObjectURL/revokeObjectURL) work under test.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = vi.fn(() => 'blob:mock');
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = vi.fn();
}

afterEach(() => {
  cleanup();
});
