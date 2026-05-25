// Diamond-list chip selector.
// Used for single-select lists (relationship, etc.) in two-column grid layout.

interface DiamondListProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2;
}

export function DiamondList<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: DiamondListProps<T>) {
  return (
    <div
      className={
        columns === 2
          ? "grid grid-cols-2 gap-x-8 gap-y-5 max-w-md mx-auto"
          : "grid grid-cols-1 gap-y-4 max-w-md mx-auto"
      }
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-3 text-left group"
          >
            {/* Diamond icon */}
            <span
              className="diamond-icon shrink-0"
              style={{
                color: selected ? "hsl(var(--primary))" : "hsl(var(--border))",
                ...(selected
                  ? { background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" }
                  : {}),
              }}
            />
            <span
              className="text-sm leading-tight transition-colors"
              style={{ color: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Legacy named export for any remaining references
export { DiamondList as ChipSelect };
