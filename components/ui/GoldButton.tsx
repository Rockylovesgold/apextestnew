"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GoldButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  showArrow?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: "h-[36px] px-[16px] text-[13px]",
  md: "h-[44px] px-[24px] text-[14px]",
  lg: "h-[52px] px-[32px] text-[15px]",
  xl: "h-[60px] px-[40px] text-[16px]",
};

const variantBase: Record<string, string> = {
  primary:
    "btn-sheen bg-[var(--color-accent-gold)] text-[var(--color-text-inverse)] hover:brightness-[1.08] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(54,128,255,0.3)] active:translate-y-0 active:shadow-none",
  secondary:
    "bg-transparent border border-[var(--color-border-emphasis)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] hover:border-white/25 hover:-translate-y-0.5",
  ghost:
    "bg-transparent border-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:translate-x-0.5 px-2",
};

export function GoldButton({
  variant = "primary",
  size = "md",
  children,
  className,
  href,
  onClick,
  type = "button",
  disabled = false,
  showArrow = false,
}: GoldButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-pill)] transition-all duration-[220ms] ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none";

  const classes = cn(base, sizeStyles[size], variantBase[variant], className);

  const inner = (
    <>
      {children}
      {showArrow && (
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(classes, "group")}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      className={cn(classes, "group")}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {inner}
    </button>
  );
}
