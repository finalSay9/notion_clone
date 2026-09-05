import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { authApi, ApiRequestError } from '../lib/api';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (password.length < 8) {
      errors.password = 'Use at least 8 characters.';
    } else if (!PASSWORD_PATTERN.test(password)) {
      errors.password =
        'Include an uppercase letter, a lowercase letter, a number, and a symbol.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({ email, password });
      // Registration only creates the account — login is a separate step,
      // so send the person there with their email pre-filled.
      navigate('/login', { state: { justRegistered: true, email } });
    } catch (err) {
      if (err instanceof ApiRequestError) {
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
      eyebrow="Create your account"
      title="Let's get you set up"
      subtitle="Takes less than a minute."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={fieldErrors.email}
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={fieldErrors.password}
          placeholder="At least 8 characters"
        />

        {formError && (
          <p className="rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-sm text-cursor-coral">
            {formError}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
