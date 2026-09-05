import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { authApi, ApiRequestError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();

  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';
  const justRegistered = (location.state as { justRegistered?: boolean } | null)
    ?.justRegistered;

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      const { user, accessToken } = await authApi.login({ email, password });
      setSession(user, accessToken);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiRequestError && err.statusCode === 401) {
        setFormError('Incorrect email or password.');
      } else if (err instanceof ApiRequestError) {
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in"
      subtitle="Pick up right where you left off."
      footerText="New here?"
      footerLinkText="Create an account"
      footerLinkTo="/register"
    >
      {justRegistered && (
        <p className="mb-4 rounded-lg bg-cursor-green/10 px-3.5 py-2.5 text-sm text-cursor-green">
          Account created. Log in to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Your password"
        />

        {formError && (
          <p className="rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-sm text-cursor-coral">
            {formError}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
