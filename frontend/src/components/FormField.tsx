interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  placeholder?: string;
}

export function FormField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  error,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink
          placeholder:text-ink-soft/50 transition-colors
          focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15
          ${error ? 'border-cursor-coral' : 'border-ink/15'}`}
      />
      {error && <span className="mt-1.5 block text-sm text-cursor-coral">{error}</span>}
    </label>
  );
}
