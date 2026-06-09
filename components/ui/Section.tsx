"use client";

import { cn } from "@/lib/utils";

type SectionVariant = "flat" | "elevated" | "dark" | "cta";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: SectionVariant;
  /** Use default section padding; set false for custom */
  padded?: boolean;
  id?: string;
}

const variantClasses: Record<SectionVariant, string> = {
  flat: "bg-bg-primary",
  elevated: "bg-bg-secondary",
  dark: "bg-bg-tertiary",
  cta: "bg-bg-secondary relative overflow-hidden",
};

export function Section({
  children,
  className,
  variant = "flat",
  padded = true,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        variantClasses[variant],
        padded && "section-padding",
        className
      )}
    >
      {children}
    </section>
  );
}
