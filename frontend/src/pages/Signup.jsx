import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function Signup() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const getErrorMessage = (err) => {
    if (!err.response) {
      return 'Cannot reach server. Make sure the backend is running and VITE_API_BASE_URL is correct (e.g. http://localhost:8000).';
    }
    const d = err.response.data;
    if (typeof d === 'string') return d;
    if (d?.detail) return d.detail;
    // DRF validation: { "username": ["msg"], "email": ["msg"] } or { "errors": { ... } }
    const errors = d?.errors || d;
    const messages = [];
    if (errors && typeof errors === 'object') {
      for (const key of ['email', 'full_name', 'password', 'non_field_errors']) {
        const val = errors[key];
        if (Array.isArray(val)) messages.push(...val);
        else if (val) messages.push(val);
      }
    }
    return messages.length ? messages.join(' ') : 'Registration failed';
  };

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await registerUser({
        email: data.email,
        full_name: data.full_name || '',
        password: data.password,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Create account</h1>
        <p className="auth-subtitle">QA Daily Tracker</p>
        <ErrorMessage error={apiError} onDismiss={() => setApiError(null)} />
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              {...register('full_name', { required: 'Full name is required' })}
            />
            {errors.full_name && <span className="field-error">{errors.full_name.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Required',
                minLength: { value: 8, message: 'Min 8 characters; include upper, lower, number, and special character' },
              })}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block">Sign up</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
