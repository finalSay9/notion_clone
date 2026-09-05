const collaborators = [
  { name: 'Amara', color: 'var(--color-cursor-coral)' },
  { name: 'Joe', color: 'var(--color-cursor-green)' },
  { name: 'Grace', color: 'var(--color-cursor-amber)' },
];

// A static, illustrative mock of a document being edited by several
// people at once — this is the actual product, not decoration.
export function LiveDocumentPanel() {
  return (
    <div className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(26,29,30,0.12)]">
      <div className="flex items-center justify-between border-b border-ink/8 px-5 py-3.5">
        <span className="font-display text-[15px] italic text-ink-soft">
          Q3 launch plan.md
        </span>
        <div className="flex -space-x-2">
          {collaborators.map((c) => (
            <div
              key={c.name}
              title={c.name}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.name[0]}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-5 py-6 text-[14px] leading-relaxed text-ink-soft">
        <p className="font-display text-lg text-ink">Launch readiness</p>
        <p>
          We're aligned on the{' '}
          <span className="relative rounded-[3px] bg-cursor-coral/15 px-0.5">
            September 12th
            <span
              className="absolute -top-4 left-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: 'var(--color-cursor-coral)' }}
            >
              Amara
            </span>
          </span>{' '}
          date. Marketing assets are{' '}
          <span className="relative rounded-[3px] bg-cursor-green/15 px-0.5">
            in final review
            <span className="absolute -bottom-4 left-0 h-4 w-0.5 animate-pulse bg-cursor-green" />
          </span>
          , and the pricing page copy needs{' '}
          <span className="rounded-[3px] bg-cursor-amber/15 px-0.5">one more pass</span>.
        </p>
        <p className="text-ink/40">Type to continue writing together...</p>
      </div>
    </div>
  );
}
