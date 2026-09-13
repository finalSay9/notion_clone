import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsApi, ApiRequestError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export function NewDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Give your document a title.');
      return;
    }
    if (!user) {
      setError('You need to be logged in to create a document.');
      return;
    }

    setLoading(true);
    try {
      console.log('user from context:', user);
      const doc = await documentsApi.create({ title, content, userId: user.id });
      navigate('/documents', { state: { justCreatedTitle: doc.title } });
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'Could not create the document. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => navigate('/documents')}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← Back to documents
        </button>

        <h1 className="mt-4 font-display text-3xl text-ink">New document</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled document"
              className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-lg font-medium text-ink placeholder:text-ink-soft/40 focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Content</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              rows={14}
              className="mt-1.5 w-full resize-y rounded-lg border border-ink/15 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-soft/40 focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-sm text-cursor-coral">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading}>
            Create document
          </Button>
        </form>
      </div>
    </div>
  );
}
