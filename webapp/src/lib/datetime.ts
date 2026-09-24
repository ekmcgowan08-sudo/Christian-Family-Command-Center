/**
 * Converts a <input type="datetime-local"> value (a naive "wall clock"
 * string with no timezone info, e.g. "2024-01-15T23:00") into a real UTC
 * ISO string, using the browser's own understanding of its local
 * timezone. Must run in the browser: `new Date(naiveString)` is parsed
 * using whichever environment executes it, and the app's server can be
 * running in any timezone (most cloud hosts default to UTC) -- only the
 * browser genuinely knows the user's intended local time. Parsing that
 * same naive string on the server instead would silently shift every
 * event by the gap between the server's timezone and the family's.
 */
export function localInputValueToUtcIso(value: string): string {
  if (!value) return "";
  return new Date(value).toISOString();
}
