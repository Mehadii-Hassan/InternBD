"use client";

interface AdSlotProps {
  placement: "header" | "sidebar" | "between-cards";
  className?: string;
}

export function AdSlot({ placement, className }: AdSlotProps) {
  const sizes = {
    header: "h-16 w-full",
    sidebar: "h-[280px] w-full",
    "between-cards": "h-20 w-full",
  };

  return (
    <div
      className={`bg-muted/50 border border-border/50 rounded-lg flex items-center justify-center text-sm text-muted-foreground mb-4 ${sizes[placement]} ${className || ""}`}
    >
      <div className="flex flex-col items-center gap-2 opacity-50">
        <span>Advertisement</span>
        <span className="text-xs">AdSense slot - {placement}</span>
      </div>
    </div>
  );
}