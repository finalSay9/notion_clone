import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from 'lucide-react';

const FONT_FAMILIES = ['Inter', 'Fraunces', 'Georgia', 'Arial', 'Courier New'];

function ToolbarButton({
  onClick,
  active,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      // preventDefault keeps focus (and the text selection) inside the
      // editor instead of the toolbar button stealing it.
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
        active ? 'bg-indigo/10 text-indigo' : 'text-ink-soft hover:bg-ink/8 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return <div className="h-[46px] border-b border-ink/8 bg-white" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/8 bg-white px-4 py-2">
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={16} />
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <select
        defaultValue="Inter"
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        className="h-8 rounded-md border border-ink/12 bg-white px-2 text-sm text-ink"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <ToolbarButton
        label="Align left"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight size={16} />
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <ToolbarButton
        label="Bulleted list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
    </div>
  );
}

// Same purely visual ruler as before — unrelated to Tiptap/Yjs.
export function EditorRuler() {
  const ticks = Array.from({ length: 17 }, (_, i) => i);
  return (
    <div className="flex justify-center border-b border-ink/8 bg-paper-dim py-1.5">
      <div className="relative h-4 w-[8.5in] max-w-full">
        <div className="absolute inset-x-0 top-1/2 h-px bg-ink/15" />
        {ticks.map((i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-ink/20"
            style={{ left: `${(i / 16) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
