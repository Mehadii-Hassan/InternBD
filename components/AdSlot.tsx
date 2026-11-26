"use client";

interface AdSlotProps {
  placement: "header" | "sidebar" | "between-cards" | "detail";
  className?: string;
}

const AD_SIZES: Record<string, string> = {
  header: "h-12 w-full",
  sidebar: "h-[250px] w-full",
  "between-cards": "h-10 w-full",
  detail: "h-16 w-full",
};

export function AdSlot({ placement, className }: AdSlotProps) {
  const enabled =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={`bg-muted/30 border border-border/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground mb-4 ${AD_SIZES[placement]} ${className || ""}`}
    >
      <div className="flex flex-col items-center gap-1 opacity-60">
        <span>Advertisement</span>
        <span className="text-[10px]">AdSense &bull; {placement}</span>
      </div>
    </div>
  );
}
