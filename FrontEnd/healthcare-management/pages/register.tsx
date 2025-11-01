import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { getSemanticErrorMessage, getFieldErrorMessage } from '@/lib/errorMessages';

const RegisterPage: React.FC = () => {
  const { register, login, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    let isValid = true;

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
      isValid = false;
    } else {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address (e.g., user@example.com)';
        isValid = false;
      }
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else {
      const strongRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+/;
      if (!strongRegex.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        isValid = false;
      }
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFieldErrors(errors);
    setFormError(null);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      await register({ name: trimmedName, email: trimmedEmail, password });
      await login(trimmedEmail, password);
      router.push('/appointments');
    } catch (err) {
      const semanticError = getSemanticErrorMessage(err);
      setFormError(semanticError);
      
      // Set field-specific errors if available
      const nameError = getFieldErrorMessage(err, 'name');
      const emailError = getFieldErrorMessage(err, 'email');
      const passwordError = getFieldErrorMessage(err, 'password');
      setFieldErrors({
        ...(nameError && { name: nameError }),
        ...(emailError && { email: emailError }),
        ...(passwordError && { password: passwordError })
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-surface dark:bg-surface-elevated p-6 rounded-lg shadow-lg border border-border dark:border-divider transition-colors">
        <h1 className="text-2xl font-semibold mb-6 text-text-primary dark:text-text-primary">Register</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className={`w-full border rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.name
                  ? 'border-danger dark:border-danger focus:ring-danger'
                  : 'border-border dark:border-divider focus:ring-primary'
              }`}
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors({ ...fieldErrors, name: undefined });
                }
              }}
              disabled={loading || submitting}
              required
              autoComplete="name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className={`w-full border rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.email
                  ? 'border-danger dark:border-danger focus:ring-danger'
                  : 'border-border dark:border-divider focus:ring-primary'
              }`}
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: undefined });
                }
              }}
              disabled={loading || submitting}
              required
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`w-full border rounded-lg px-3 py-2 pr-10 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.password
                    ? 'border-danger dark:border-danger focus:ring-danger'
                    : 'border-border dark:border-divider focus:ring-primary'
                }`}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: undefined });
                  }
                  // Clear confirm password error if passwords now match
                  if (fieldErrors.confirmPassword && e.target.value === confirmPassword) {
                    setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                  }
                }}
                disabled={loading || submitting}
                required
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-2 text-sm text-text-secondary dark:text-text-tertiary hover:text-text-primary dark:hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className={`w-full border rounded-lg px-3 py-2 pr-10 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.confirmPassword
                    ? 'border-danger dark:border-danger focus:ring-danger'
                    : 'border-border dark:border-divider focus:ring-primary'
                }`}
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                  }
                }}
                disabled={loading || submitting}
                required
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute inset-y-0 right-2 text-sm text-text-secondary dark:text-text-tertiary hover:text-text-primary dark:hover:text-text-secondary transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-danger dark:text-danger" role="alert">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          {formError && !fieldErrors.name && !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword && (
            <div className="mb-4 p-3 bg-danger/10 dark:bg-danger/20 border border-danger/20 dark:border-danger/30 rounded-lg">
              <p className="text-danger dark:text-danger font-medium text-sm" role="alert">
                {formError}
              </p>
            </div>
          )}
          {successMsg && <p className="mb-4 text-success dark:text-success font-medium">{successMsg}</p>}
          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full bg-primary dark:bg-primary-dark text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
          >
            {loading || submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterPage;


