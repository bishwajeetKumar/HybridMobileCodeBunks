// Pure formatting / parsing helpers. No DOM, no side effects — easy to unit test.

/** Parse a possibly comma-formatted string into a number, defaulting to 0. */
export function num(value) {
  const n = parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

/** Parse into a number, or null when blank / invalid. */
export function numOrNull(value) {
  const t = String(value ?? '').trim();
  if (!t) return null;
  const n = parseFloat(t.replace(/,/g, ''));
  return Number.isNaN(n) ? null : n;
}

/** URL/file-safe slug. */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'client';
}

/** Whole-dollar display, e.g. 2500 -> "$2,500". */
export function formatCurrency(value) {
  return '$' + num(value).toLocaleString();
}

/** Rate display with up to 4 decimals, e.g. 0.012 -> "$0.012". */
export function formatRate(value) {
  return '$' + num(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
