import { cn } from "@/lib/utils";

interface CounterProps {
  label: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function StepCounter({ label, description, value, min = 0, max = 20, onChange }: CounterProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div>
        <p className="text-base font-normal text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            "w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg transition-colors",
            value <= min ? "text-muted-foreground/30 border-border/30 cursor-not-allowed" : "text-muted-foreground hover:border-foreground hover:text-foreground"
          )}
        >
          −
        </button>
        <span className="w-6 text-center text-base font-normal">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            "w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg transition-colors",
            value >= max ? "text-muted-foreground/30 border-border/30 cursor-not-allowed" : "text-muted-foreground hover:border-foreground hover:text-foreground"
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}
