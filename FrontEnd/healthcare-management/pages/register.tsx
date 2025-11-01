import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

const RegisterPage: React.FC = () => {
  const { register, login, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Name is required and must be at least 2 characters long.');
      return false;
    }
    if (!trimmedEmail) {
      setFormError('Email is required.');
      return false;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Email format is invalid.');
      return false;
    }
    if (!password || password.length < 8) {
      setFormError('Password is required and must be at least 8 characters long.');
      return false;
    }
    const strongRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+/;
    if (!strongRegex.test(password)) {
      setFormError('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      await register({ name: trimmedName, email: trimmedEmail, password });
      await login(trimmedEmail, password);
      router.push('/appointments');
    } catch (err) {
      setFormError((err as Error).message || 'Registration failed');
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
              className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading || submitting}
              required
              autoComplete="name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-1 text-text-primary dark:text-text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading || submitting}
              required
              autoComplete="email"
            />
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
                className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 pr-10 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading || submitting}
                required
                autoComplete="new-password"
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
                className="w-full border border-border dark:border-divider rounded-lg px-3 py-2 pr-10 bg-surface dark:bg-surface text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading || submitting}
                required
                autoComplete="new-password"
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
          </div>
          {formError && <p className="mb-4 text-danger dark:text-danger font-medium">{formError}</p>}
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


