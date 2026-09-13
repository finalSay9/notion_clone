import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { documentsApi, ApiRequestError, type DocumentRecord } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export function Documents() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const justCreatedTitle = (location.state as { justCreatedTitle?: string } | null)
    ?.justCreatedTitle;

  const [docs, setDocs] = useState<DocumentRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    documentsApi
      .listMine(user.id)
      .then((result) => {
        if (!cancelled) setDocs(result.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError
            ? err.message
            : 'Could not load your documents.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg italic text-ink">Together</span>
          <button
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/5"
          >
            Log out
          </button>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h1 className="font-display text-3xl text-ink">Your documents</h1>
          <Link to="/documents/new">
            <Button>+ New document</Button>
          </Link>
        </div>

        {justCreatedTitle && (
          <p className="mt-6 rounded-lg bg-cursor-green/10 px-3.5 py-2.5 text-sm text-cursor-green">
            "{justCreatedTitle}" was created.
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-sm text-cursor-coral">
            {error}
          </p>
        )}

        <div className="mt-6 divide-y divide-ink/8 rounded-xl border border-ink/10 bg-white">
          {docs === null && !error && (
            <p className="px-5 py-6 text-sm text-ink-soft">Loading your documents...</p>
          )}

          {docs?.length === 0 && (
            <p className="px-5 py-8 text-center text-[15px] text-ink-soft">
              No documents yet. Create your first one to get started.
            </p>
          )}

          {docs?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-paper-dim"
            >
              <div>
                <p className="font-display text-lg text-ink">{doc.title || 'Untitled'}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">
                  {doc.content || 'No content yet'}
                </p>
              </div>
              <span className="shrink-0 text-xs text-ink-soft/60">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
