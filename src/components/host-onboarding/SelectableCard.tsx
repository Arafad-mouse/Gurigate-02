import { cn } from "@/lib/utils";

interface SelectableCardProps {
  icon?: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function SelectableCard({ icon, label, selected, onClick, className }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
        selected
          ? "border-foreground bg-secondary/50"
          : "border-border hover:border-foreground/40",
        className
      )}
      style={{ pointerEvents: 'auto' }}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
