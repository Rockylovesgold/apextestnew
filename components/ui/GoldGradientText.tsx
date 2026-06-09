"use client";

import { cn } from "@/lib/utils";

interface GoldGradientTextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  animated?: boolean;
}

export function GoldGradientText({
  children,
  className,
  as: Tag = "span",
  animated = true,
}: GoldGradientTextProps) {
  return (
    <Tag
      className={cn(
        animated ? "gold-gradient-text-animated" : "gold-gradient-text",
        className
      )}
    >
      {children}
    </Tag>
  );
}
