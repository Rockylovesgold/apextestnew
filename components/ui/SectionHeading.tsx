"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "section-header reveal",
        isCenter ? "text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="label-eyebrow stagger-up" style={{ ["--stagger-index" as string]: 0 }}>
          {eyebrow}
        </span>
      )}
      <h2
        className="stagger-up"
        style={{
          ["--stagger-index" as string]: 1,
          maxWidth: isCenter ? "none" : undefined,
          margin: isCenter ? "0 auto 16px" : "0 0 16px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="stagger-up"
          style={{
            ["--stagger-index" as string]: 2,
            color: "var(--color-text-secondary)",
            maxWidth: "560px",
            lineHeight: "var(--leading-relaxed)",
            margin: isCenter ? "0 auto" : "0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
