import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally joins class names and resolves Tailwind conflicts.
 *
 * Combines `clsx` (conditional classes) with `tailwind-merge` (last-wins for
 * conflicting Tailwind utilities) — the standard shadcn-style helper.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
