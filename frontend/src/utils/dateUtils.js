/**
 * Maximum selectable date for date pickers (today). Future dates are not allowed.
 * @returns {string} ISO date string YYYY-MM-DD
 */
export function getMaxDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns true if the given date string (YYYY-MM-DD) is in the future.
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr > today;
}
