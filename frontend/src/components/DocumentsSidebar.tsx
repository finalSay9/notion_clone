import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { documentsApi, type DocumentRecord } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface DocumentsSidebarProps {
  activeDocId?: string;
}

// The left rail showing the person's other documents, visible while
// editing one — same idea as Google Docs' left-hand doc switcher,
// scoped down to "your documents" rather than full Drive folders.
export function DocumentsSidebar({ activeDocId }: DocumentsSidebarProps) {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentRecord[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    documentsApi
      .listMine(user.id)
      .then((result) => {
        if (!cancelled) setDocs(result.data);
      })
      .catch(() => {
        if (!cancelled) setDocs([]);
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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-ink/8 bg-paper-dim">
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/documents" className="font-display text-lg italic text-ink">
          Together
        </Link>
      </div>

      <Link
        to="/documents"
        className="mx-3 mb-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-white"
      >
        ← All documents
      </Link>

      <div className="flex-1 overflow-y-auto px-2">
        <p className="px-3 pb-1.5 pt-3 text-xs font-medium uppercase tracking-wide text-ink-soft/50">
          Your documents
        </p>
        {docs === null && (
          <p className="px-3 py-2 text-sm text-ink-soft">Loading...</p>
        )}
        {docs?.map((doc) => (
          <Link
            key={doc.id}
            to={`/documents/${doc.id}`}
            className={`block truncate rounded-lg px-3 py-2 text-sm transition-colors ${
              doc.id === activeDocId
                ? 'bg-indigo/10 font-medium text-indigo'
                : 'text-ink-soft hover:bg-white'
            }`}
          >
            {doc.title || 'Untitled'}
          </Link>
        ))}
      </div>

      <div className="border-t border-ink/8 px-4 py-3">
        <p className="truncate text-sm text-ink-soft">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-1 text-sm font-medium text-ink-soft hover:text-ink"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
