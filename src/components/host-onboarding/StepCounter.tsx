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
  const handleDecrease = () => {
    if (value > min) {
      const newValue = value - 1;
      onChange(newValue);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      const newValue = value + 1;
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div>
        <p className="text-base font-normal text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className={cn(
            "w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg transition-all duration-200",
            "active:scale-95 active:bg-muted",
            value <= min
              ? "text-muted-foreground/30 border-border/30 cursor-not-allowed"
              : "text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer hover:bg-muted/50"
          )}
        >
          −
        </button>
        <span className="w-6 text-center text-base font-normal" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className={cn(
            "w-8 h-8 rounded-full border border-border flex items-center justify-center text-lg transition-all duration-200",
            "active:scale-95 active:bg-muted",
            value >= max
              ? "text-muted-foreground/30 border-border/30 cursor-not-allowed"
              : "text-muted-foreground hover:border-foreground hover:text-foreground cursor-pointer hover:bg-muted/50"
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}
