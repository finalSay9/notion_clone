import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from 'lucide-react';


const FONT_FAMILIES = ['Inter', 'Fraunces', 'Georgia', 'Arial', 'Courier New'];
const FONT_SIZES = ['1', '2', '3', '4', '5', '6', '7']; // execCommand's coarse size scale

function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // onMouseDown + preventDefault keeps focus (and the text selection)
      // inside the editable area instead of the toolbar stealing it.
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-ink/8 hover:text-ink"
    >
      {children}
    </button>
  );
}

export function EditorToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink/8 bg-white px-4 py-2">
      <select
        defaultValue="Inter"
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => runCommand('fontName', e.target.value)}
        className="h-8 rounded-md border border-ink/12 bg-white px-2 text-sm text-ink"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        defaultValue="3"
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => runCommand('fontSize', e.target.value)}
        className="h-8 w-16 rounded-md border border-ink/12 bg-white px-2 text-sm text-ink"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <ToolbarButton label="Bold" onClick={() => runCommand('bold')}>
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => runCommand('italic')}>
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton label="Underline" onClick={() => runCommand('underline')}>
        <Underline size={16} />
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <ToolbarButton label="Align left" onClick={() => runCommand('justifyLeft')}>
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton label="Align center" onClick={() => runCommand('justifyCenter')}>
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton label="Align right" onClick={() => runCommand('justifyRight')}>
        <AlignRight size={16} />
      </ToolbarButton>

      <div className="mx-1.5 h-5 w-px bg-ink/10" />

      <ToolbarButton label="Bulleted list" onClick={() => runCommand('insertUnorderedList')}>
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => runCommand('insertOrderedList')}>
        <ListOrdered size={16} />
      </ToolbarButton>
    </div>
  );
}

// A purely visual ruler, like Google Docs' — not functionally tied to
// margins yet. It grounds the page in the "familiar document editor"
// feel; wiring it to real margin controls is a later, separate task.
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
