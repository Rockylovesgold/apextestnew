"use client";

import { cn } from "@/lib/utils";

interface StatCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  className?: string;
}

/**
 * StatCounter renders a number with data-target attribute.
 * The count-up animation is handled by initCounterAnimations() in scrollAnimations.ts.
 */
export function StatCounter({
  target,
  prefix = "",
  suffix = "",
  label,
  className,
}: StatCounterProps) {
  return (
    <div className={cn("stat-item reveal", className)}>
      <div
        className="stat-number"
        data-target={target}
        data-prefix={prefix}
        data-suffix={suffix}
        suppressHydrationWarning
      >
        {prefix}{target.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
