import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentsApi, ApiRequestError, type DocumentRecord } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    let cancelled = false;
    setLoading(true);

    documentsApi
      .getById(id, user.id)
      .then((result) => {
        if (!cancelled) setDoc(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError
            ? err.message
            : 'Could not load this document.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  return (
    <div className="min-h-screen bg-paper px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate('/documents')}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← Back to documents
        </button>

        {loading && (
          <p className="mt-8 text-sm text-ink-soft">Loading document...</p>
        )}

        {error && (
          <p className="mt-8 rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-sm text-cursor-coral">
            {error}
          </p>
        )}

        {doc && !loading && (
          <article className="mt-8">
            <h1 className="font-display text-3xl text-ink">
              {doc.title || 'Untitled'}
            </h1>
            <p className="mt-1 text-xs text-ink-soft/60">
              Last updated {new Date(doc.updatedAt).toLocaleString()}
            </p>
            <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
              {doc.content || 'This document is empty.'}
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
