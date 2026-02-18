/**
 * Reusable auth layout: full-screen centered card with company logo,
 * soft gradient background, and subtle watermark. Used by Login and Signup.
 */
import logoUrl from '../../assets/logo.png';
import './AuthLayout.css';

export function AuthLayout({ children, title, subtitle, wide = false }) {
  return (
    <div className="auth-layout" role="main">
      <div className="auth-layout-bg" aria-hidden="true">
        <div className="auth-layout-gradient" />
        <img
          src={logoUrl}
          alt=""
          className="auth-watermark"
        />
      </div>
      <div className={`auth-layout-card ${wide ? 'auth-layout-card--wide' : ''}`}>
        <div className="auth-layout-card-inner">
          <img
            src={logoUrl}
            alt="ideyaLabs"
            className="auth-logo"
          />
          {title && <h1 className="auth-layout-title">{title}</h1>}
          {subtitle && <p className="auth-layout-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
