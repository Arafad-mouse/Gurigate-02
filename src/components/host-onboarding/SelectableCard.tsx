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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all cursor-pointer relative z-10",
        selected
          ? "border-[#bb1f3a] bg-[#bb1f3a]/10 ring-2 ring-[#bb1f3a]"
          : "border-border hover:border-[#bb1f3a] hover:bg-muted/50",
        className
      )}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
