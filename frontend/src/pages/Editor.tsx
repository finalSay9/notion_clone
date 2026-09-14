import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { documentsApi, ApiRequestError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DocumentsSidebar } from '../components/DocumentsSidebar';
import { EditorToolbar, EditorRuler } from '../components/EditorToolbar';
import { templates } from '../data/templates';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function Editor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') ?? 'blank';
  const { user } = useAuth();
  const navigate = useNavigate();

  const isNew = !id;
  const template = templates.find((t) => t.id === templateId) ?? templates[0];

  const [documentId, setDocumentId] = useState<string | undefined>(id);
  const [title, setTitle] = useState(isNew ? '' : '');
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const editableRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load an existing document, or seed a new one from its template.
  useEffect(() => {
    if (!user) return;

    if (isNew) {
      setTitle('Untitled document');
      if (editableRef.current) {
        editableRef.current.innerHTML = template.initialContent;
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    documentsApi
      .getById(id!, user.id)
      .then((doc) => {
        if (cancelled) return;
        setTitle(doc.title);
        if (editableRef.current) {
          editableRef.current.innerHTML = doc.content;
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError ? err.message : 'Could not load this document.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  function scheduleSave() {
    setSaveState('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(save, 800); // debounce while typing
  }

  async function save(overrideTitle?: string) {
    if (!user) return;
    const content = editableRef.current?.innerHTML ?? '';
    const currentTitle = overrideTitle ?? title;

    try {
      if (!documentId) {
        // First save of a brand-new document — create it, then remember
        // its id so subsequent saves update the same row.
        const created = await documentsApi.create({
          title: currentTitle || 'Untitled document',
          content,
          userId: user.id,
        });
        setDocumentId(created.id);
        navigate(`/documents/${created.id}`, { replace: true });
      } else {
        // NOTE: documentsApi.update needs to exist once the update
        // endpoint you're building on the backend is ready — see below.
        await documentsApi.update(documentId, {
          title: currentTitle || 'Untitled document',
          content,
          userId: user.id,
        });
      }
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setError(err instanceof ApiRequestError ? err.message : 'Could not save.');
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSaveState('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => save(value), 800);
  }

  return (
    <div className="flex h-screen bg-paper">
      <DocumentsSidebar activeDocId={documentId} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/8 bg-white px-6 py-3">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled document"
            className="font-display text-xl text-ink outline-none placeholder:text-ink-soft/40"
          />
          <span className="text-xs text-ink-soft/60">
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'saved' && 'Saved'}
            {saveState === 'error' && 'Could not save'}
          </span>
        </div>

        <EditorToolbar />
        <EditorRuler />

        <div className="flex-1 overflow-y-auto py-10">
          {loading ? (
            <p className="text-center text-sm text-ink-soft">Loading...</p>
          ) : error ? (
            <p className="mx-auto max-w-md rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-center text-sm text-cursor-coral">
              {error}
            </p>
          ) : (
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={scheduleSave}
              className="mx-auto min-h-[11in] w-[8.5in] max-w-full bg-white px-[1in] py-[1in] text-[15px] leading-relaxed text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(26,29,30,0.15)] outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
