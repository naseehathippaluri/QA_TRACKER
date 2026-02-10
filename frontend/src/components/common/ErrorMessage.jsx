/**
 * Displays API or validation error message.
 */
export function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.detail || error.message || 'Something went wrong';
  const details = error.errors ? Object.values(error.errors).flat().join(' ') : null;
  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
      {details && <span className="error-details"> {details}</span>}
      {onDismiss && (
        <button type="button" className="error-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
