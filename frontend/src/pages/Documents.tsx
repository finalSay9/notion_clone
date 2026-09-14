import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { documentsApi, ApiRequestError, type DocumentRecord } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { templates } from '../data/templates';

function TemplateCard({ id, name }: { id: string; name: string }) {
  return (
    <Link to={`/documents/new?template=${id}`} className="group w-40 shrink-0">
      <div className="flex aspect-[8.5/11] w-40 flex-col items-center justify-center rounded-lg border border-ink/10 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_-6px_rgba(26,29,30,0.18)]">
        {id === 'blank' ? (
          <span className="font-display text-3xl italic text-ink/20">+</span>
        ) : (
          <div className="w-full space-y-1.5">
            <div className="h-2 w-3/4 rounded-sm bg-ink/15" />
            <div className="h-1.5 w-full rounded-sm bg-ink/8" />
            <div className="h-1.5 w-5/6 rounded-sm bg-ink/8" />
            <div className="h-1.5 w-full rounded-sm bg-ink/8" />
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-ink">{name}</p>
    </Link>
  );
}

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
          err instanceof ApiRequestError ? err.message : 'Could not load your documents.',
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
    <div className="min-h-screen bg-paper">
      <div className="border-b border-ink/8 bg-white px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-display text-lg italic text-ink">Together</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <p className="text-sm font-medium text-ink-soft">Start a new document</p>
        <div className="mt-4 flex gap-5 overflow-x-auto pb-2">
          {templates.map((t) => (
            <TemplateCard key={t.id} id={t.id} name={t.name} />
          ))}
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

        <p className="mt-10 text-sm font-medium text-ink-soft">Your documents</p>
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {docs === null && !error && (
            <p className="col-span-full text-sm text-ink-soft">Loading...</p>
          )}
          {docs?.length === 0 && (
            <p className="col-span-full text-sm text-ink-soft">
              No documents yet — pick a template above to create your first one.
            </p>
          )}
          {docs?.map((doc) => (
            <Link key={doc.id} to={`/documents/${doc.id}`} className="group">
              <div className="aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-ink/10 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_-6px_rgba(26,29,30,0.18)]">
                <div
                  className="h-full w-full origin-top-left scale-[0.3] text-ink"
                  dangerouslySetInnerHTML={{ __html: doc.content }}
                />
              </div>
              <p className="mt-2 truncate text-sm font-medium text-ink">
                {doc.title || 'Untitled'}
              </p>
              <p className="text-xs text-ink-soft/60">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
