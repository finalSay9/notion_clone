import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { documentsApi, ApiRequestError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

interface ShareDialogProps {
  documentId: string;
  onClose: () => void;
}

export function ShareDialog({ documentId, onClose }: ShareDialogProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccess(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await documentsApi.invite(documentId, { email, role, userId: user.id });
      setSuccess(`Invited ${email} as ${role === 'EDITOR' ? 'an editor' : 'a viewer'}.`);
      setEmail('');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not send the invite.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-[0_8px_32px_-8px_rgba(26,29,30,0.3)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Share document</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-ink/8 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="someone@example.com"
              autoFocus
              className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/40 focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Permission</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'VIEWER' | 'EDITOR')}
              className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15"
            >
              <option value="VIEWER">Can view</option>
              <option value="EDITOR">Can edit</option>
            </select>
          </label>

          {error && (
            <p className="rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-sm text-cursor-coral">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-cursor-green/10 px-3.5 py-2.5 text-sm text-cursor-green">
              {success}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Send invite
          </Button>
        </form>
      </div>
    </div>
  );
}
