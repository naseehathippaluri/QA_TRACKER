import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { AuthLayout } from '../components/common/AuthLayout';
import { isCompanyEmail, COMPANY_EMAIL_MESSAGE } from '../utils/emailDomain';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const onSubmit = async (data) => {
    setApiError(null);
    if (!isCompanyEmail(data.email)) {
      setApiError(COMPANY_EMAIL_MESSAGE);
      return;
    }
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      const d = err.response?.data;
      setApiError(d?.email?.[0] || d?.detail || 'Invalid email or password');
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="QA Daily Tracker">
      <ErrorMessage error={apiError} onDismiss={() => setApiError(null)} />
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              validate: (v) => isCompanyEmail(v) || COMPANY_EMAIL_MESSAGE,
            })}
          />
          <span className="form-hint">Only company email (@ideyalabs.com) allowed</span>
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </div>
        <button type="submit" className="btn-auth-primary">
          Sign in
        </button>
      </form>
      <p className="auth-layout-footer">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
