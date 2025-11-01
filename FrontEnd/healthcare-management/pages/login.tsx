import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { getSemanticErrorMessage, getFieldErrorMessage } from '@/lib/errorMessages';

const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/appointments');
    }
  }, [user, router]);

  const validateEmail = (value: string): string | undefined => {
    const trimmedEmail = value.trim();
    if (!trimmedEmail) {
      return 'Email address is required';
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required';
    }
    return undefined;
  };

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    const emailError = validateEmail(email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.password = passwordError;
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
      await login(email.trim(), password);
      router.push('/appointments');
    } catch (err) {
      const semanticError = getSemanticErrorMessage(err);
      setFormError(semanticError);
      
      // Set field-specific errors if available
      const emailError = getFieldErrorMessage(err, 'email');
      const passwordError = getFieldErrorMessage(err, 'password');
      setFieldErrors({
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
        <h1 className="text-2xl font-semibold mb-6 text-text-primary dark:text-text-primary">Login</h1>
        <form onSubmit={handleSubmit} noValidate>
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
                // Only clear error if the field is now valid (returns undefined)
                if (fieldErrors.email && validateEmail(e.target.value) === undefined) {
                  setFieldErrors({ ...fieldErrors, email: undefined });
                }
              }}
              onBlur={() => {
                const error = validateEmail(email);
                setFieldErrors({ ...fieldErrors, email: error });
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
                  // Only clear error if the field is now valid (returns undefined)
                  if (fieldErrors.password && validatePassword(e.target.value) === undefined) {
                    setFieldErrors({ ...fieldErrors, password: undefined });
                  }
                }}
                onBlur={() => {
                  const error = validatePassword(password);
                  setFieldErrors({ ...fieldErrors, password: error });
                }}
                disabled={loading || submitting}
                required
                autoComplete="current-password"
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
          {formError && !fieldErrors.email && !fieldErrors.password && (
            <div className="mb-4 p-3 bg-danger/10 dark:bg-danger/20 border border-danger/20 dark:border-danger/30 rounded-lg">
              <p className="text-danger dark:text-danger font-medium text-sm" role="alert">
                {formError}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full bg-primary dark:bg-primary-dark text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
          >
            {loading || submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default LoginPage;


