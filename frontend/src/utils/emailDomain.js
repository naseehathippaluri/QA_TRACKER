/**
 * Company email domain restriction: only @ideyalabs.com allowed.
 * Used for client-side validation; backend is the source of truth.
 */
export const ALLOWED_EMAIL_DOMAIN = 'ideyalabs.com';

/**
 * Returns true if the email has the allowed company domain (case-insensitive).
 * @param {string} email
 * @returns {boolean}
 */
export function isCompanyEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const domain = email.trim().toLowerCase().split('@').pop();
  return domain === ALLOWED_EMAIL_DOMAIN;
}

/**
 * Validation message for non-company email.
 */
export const COMPANY_EMAIL_MESSAGE = 'Please use your company email address.';
