"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    variant?: "default" | "secondary" | "destructive" | "outline";
  }
>(({ className, variant, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : variant === "secondary"
          ? "bg-secondary text-secondary-foreground"
          : variant === "destructive"
          ? "bg-destructive text-destructive-foreground"
          : variant === "outline"
          ? "border input bg-background"
          : "",
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
