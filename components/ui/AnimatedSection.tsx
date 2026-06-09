"use client";

import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  group?: boolean;
}

/**
 * AnimatedSection applies the CSS-class-based reveal animation.
 * The IntersectionObserver in scrollAnimations.ts adds `.in-view` on scroll entry.
 */
export function AnimatedSection({
  children,
  className,
  group = false,
}: AnimatedSectionProps) {
  return (
    <div className={cn(group ? "reveal-group" : "reveal", className)}>
      {children}
    </div>
  );
}
