/**
 * Joins class names, skipping anything falsy.
 *
 * Tailwind decides which of two conflicting utilities wins by stylesheet
 * order, not by their order in this string, so the primitives expose variants
 * instead of asking callers to override padding or colour. Pass `className`
 * for layout only (margin, width, grid placement).
 */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
