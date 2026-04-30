import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipSelectProps<T extends string> {
  options: { value: T; label: string; description?: string }[];
  value: T | T[] | null;
  onChange: (value: T) => void;
  multi?: boolean;
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  multi,
}: ChipSelectProps<T>) {
  const selected = (val: T) =>
    multi ? Array.isArray(value) && value.includes(val) : value === val;

  return (
    <div className="grid gap-2">
      {options.map((opt) => {
        const isSelected = selected(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "text-left px-4 py-3 rounded-lg border transition-all flex items-start gap-3",
              "hover-elevate active-elevate-2",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card",
            )}
          >
            <div
              className={cn(
                "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                isSelected ? "bg-primary border-primary" : "border-border",
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{opt.label}</div>
              {opt.description && (
                <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
