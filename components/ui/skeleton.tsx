"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    variant?: "text" | "circle" | "rect" | "button";
  }
>(({ className, variant = "text", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variant === "text" && "h-4 w-full",
        variant === "circle" && "h-8 w-8 rounded-full",
        variant === "rect" && "h-32 w-full",
        variant === "button" && "h-10 w-24",
        className
      )}
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
