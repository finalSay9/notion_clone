import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trash2, UserPlus } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { documentsApi, ApiRequestError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DocumentsSidebar } from '../components/DocumentsSidebar';
import { EditorToolbar, EditorRuler } from '../components/EditorToolbar';
import { CollaboratorAvatars } from '../components/CollaboratorAvatars';
import { ShareDialog } from '../components/ShareDialog';
import { colorForUser } from '../lib/collabColors';
import { templates } from '../data/templates';

// The collaboration WebSocket is served directly by documents-service
// (merged onto its HTTP port via Hocuspocus/crossws), NOT proxied
// through api-gateway — gateway only handles REST today. Point this
// at wherever documents-service actually listens.
const COLLAB_WS_URL = import.meta.env.VITE_COLLAB_WS_URL ?? 'ws://localhost:3002';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type CollabUser = { clientId: number; name?: string; color?: string };

export function Editor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const templateId = searchParams.get('template') ?? 'blank';
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const isNew = !id;

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [collaborators, setCollaborators] = useState<CollabUser[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [collab, setCollab] = useState<{ ydoc: Y.Doc; provider: HocuspocusProvider } | null>(
    null,
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against React StrictMode's dev-only double-invoke of
  // effects, which would otherwise fire this create() call twice —
  // the ref survives the mount→cleanup→mount cycle since it isn't
  // reset by StrictMode's simulated unmount.
  const hasCreatedRef = useRef(false);

  // ---- New document: create it immediately, then redirect to its
  // real id. Everything past this point treats "isNew" as done —
  // a brand-new document is really just an existing empty document
  // whose first client happens to seed it from a template.
  useEffect(() => {
    if (!isNew || !user) return;
    if (hasCreatedRef.current) return;
    hasCreatedRef.current = true;

    documentsApi
      .create({ title: 'Untitled document', content: '', userId: user.id })
      .then((created) => {
        navigate(`/documents/${created.id}`, {
          replace: true,
          state: { seedTemplate: templateId },
        });
      })
      .catch((err) => {
        hasCreatedRef.current = false; // allow retry if it genuinely failed
        setError(err instanceof ApiRequestError ? err.message : 'Could not create the document.');
      });
  }, [isNew, user, templateId, navigate]);

  const legacyContentRef = useRef<string>('');

  // ---- Load this document's title (Yjs holds the rich content;
  // title is plain metadata that lives in Postgres directly). We
  // also stash the OLD plain-HTML content here, in case this document
  // predates the Yjs migration and needs a one-time seed — see the
  // sync effect below.
  useEffect(() => {
    if (isNew || !id || !user) return;
    let cancelled = false;
    setLoading(true);

    documentsApi
      .getById(id, user.id)
      .then((doc) => {
        if (!cancelled) {
          setTitle(doc.title);
          legacyContentRef.current = doc.content ?? '';
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : 'Could not load this document.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isNew, user]);

  // ---- Open the live collaboration connection for this document.
  // Fresh Y.Doc + provider per document id; torn down cleanly when
  // you navigate to a different document or leave the editor.
  useEffect(() => {
    if (isNew || !id || !user) return;

    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: COLLAB_WS_URL,
      name: id,
      document: ydoc,
      token: user?.id ??  '',
    });

    setCollab({ ydoc, provider });
    setIsSynced(false);

    const handleSynced = () => setIsSynced(true);
    provider.on('synced', handleSynced);

    return () => {
      provider.off('synced', handleSynced);
      provider.destroy();
      ydoc.destroy();
      setCollab(null);
    };
  }, [id, isNew, user, accessToken]);

  const editor = useEditor(
    {
      editable: !!collab,
      extensions: [
        StarterKit.configure({
          // Collaboration brings its own Yjs-aware undo/redo — the
          // built-in undoRedo extension would conflict with it.
          undoRedo: false,
        }),
        TextStyle,
        FontFamily,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ...(collab
          ? [
              Collaboration.configure({ document: collab.ydoc }),
              CollaborationCaret.configure({
                provider: collab.provider,
                user: {
                  name: user?.email ?? 'Someone',
                  color: colorForUser(user?.id ?? 'anon'),
                },
              }),
            ]
          : []),
      ],
    },
    [collab],
  );

  // Seed a brand-new document from its template, once, the first
  // time this client fully syncs with an EMPTY document. Safe even
  // with concurrent viewers: if the doc already has content by the
  // time we sync, editor.isEmpty is false and we skip seeding.
  // Seed a brand-new document from its template, or — one-time
  // migration for documents created before Yjs existed — from the
  // legacy plain-HTML `content` field. Either way, only when this
  // client is the first to see a genuinely empty Yjs document, so we
  // never clobber real collaborative content that's already there.
  useEffect(() => {
    if (!collab || !editor || !isSynced) return;
    if (!editor.isEmpty) return;

    const seedTemplate = (location.state as { seedTemplate?: string } | null)?.seedTemplate;

    if (seedTemplate) {
      const tmpl = templates.find((t) => t.id === seedTemplate);
      if (tmpl?.initialContent) {
        editor.commands.setContent(tmpl.initialContent);
      }
      // Clear the seed flag from history state so reconnecting later
      // (or a second tab) never re-seeds over real content.
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (legacyContentRef.current.trim()) {
      editor.commands.setContent(legacyContentRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collab, editor, isSynced]);

  // Track who else is currently connected, for the avatar strip.
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      setCollaborators(editor.storage.collaborationCaret?.users ?? []);
    };
    editor.on('transaction', update);
    update();
    return () => {
      editor.off('transaction', update);
    };
  }, [editor]);

  // Debounced-save the plain-HTML mirror whenever the collaborative
  // content actually changes (not just on transactions like cursor
  // moves — 'update' fires specifically on content changes).
  const titleRef = useRef(title);
  titleRef.current = title;

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => scheduleMetadataSave(titleRef.current);
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  function scheduleMetadataSave(nextTitle: string) {
    setSaveState('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveMetadata(nextTitle), 800);
  }

  // This saves TITLE (plain metadata) and a plain-HTML MIRROR of the
  // content, purely so the gallery's thumbnail cards have something
  // to render. The actual authoritative, real-time-synced content
  // lives in Yjs/Postgres via Hocuspocus's onStoreDocument — this
  // REST save is a convenience copy, not the source of truth.
  async function saveMetadata(nextTitle: string) {
    if (!user || !id || !editor) return;
    try {
      await documentsApi.update(id, {
        title: nextTitle || 'Untitled document',
        content: editor.getHTML(),
        userId: user.id,
      });
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setError(err instanceof ApiRequestError ? err.message : 'Could not save.');
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    scheduleMetadataSave(value);
  }

  async function handleDelete() {
    if (!user || !id) return;
    if (!window.confirm(`Delete "${title || 'Untitled document'}"? This can't be undone.`)) {
      return;
    }
    try {
      await documentsApi.remove(id, user.id);
      navigate('/documents');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not delete the document.');
    }
  }

  if (isNew) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-soft">Creating your document...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-paper">
      <DocumentsSidebar activeDocId={id} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/8 bg-white px-6 py-3">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled document"
            className="font-display text-xl text-ink outline-none placeholder:text-ink-soft/40"
          />
          <div className="flex items-center gap-4">
            <CollaboratorAvatars users={collaborators} />
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-ink/12 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <UserPlus size={14} />
              Share
            </button>
            <span className="flex items-center gap-1.5 text-xs text-ink-soft/60">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isSynced ? 'bg-cursor-green' : 'bg-ink-soft/30'
                }`}
              />
              {isSynced ? 'Live' : 'Connecting...'}
            </span>
            <span className="text-xs text-ink-soft/60">
              {saveState === 'saving' && 'Saving...'}
              {saveState === 'saved' && 'Saved'}
              {saveState === 'error' && 'Could not save'}
            </span>
            <button
              onClick={handleDelete}
              title="Delete document"
              aria-label="Delete document"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-cursor-coral/10 hover:text-cursor-coral"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {shareOpen && id && (
          <ShareDialog documentId={id} onClose={() => setShareOpen(false)} />
        )}

        <EditorToolbar editor={editor} />
        <EditorRuler />

        <div className="relative flex-1 overflow-y-auto py-10">
          {(loading || !collab || !isSynced) && (
            <p className="absolute inset-x-0 top-4 text-center text-sm text-ink-soft">
              {loading ? 'Loading...' : 'Connecting to live session...'}
            </p>
          )}
          {error && (
            <p className="mx-auto mb-4 max-w-md rounded-lg bg-cursor-coral/10 px-3.5 py-2.5 text-center text-sm text-cursor-coral">
              {error}
            </p>
          )}
          <div className="mx-auto min-h-[11in] w-[8.5in] max-w-full bg-white px-[1in] py-[1in] text-[15px] leading-relaxed text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(26,29,30,0.15)]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
