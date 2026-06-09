"use client";

import { TrendingUp, Users, Target, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cards: { icon: LucideIcon; title: string; line: string; bgGradient: string }[] = [
  {
    icon: TrendingUp,
    title: "Gold market focus",
    line: "XAU/USD and BTC/USD. Execution-first analysis.",
    bgGradient: "linear-gradient(135deg, rgba(54,128,255,0.08) 0%, rgba(54,128,255,0.02) 100%)",
  },
  {
    icon: Users,
    title: "Community-driven analysis",
    line: "Shared ideas, discussion, and peer support.",
    bgGradient: "linear-gradient(135deg, rgba(54,128,255,0.08) 0%, rgba(54,128,255,0.02) 100%)",
  },
  {
    icon: Target,
    title: "Disciplined execution",
    line: "Structured setups with clear risk parameters.",
    bgGradient: "linear-gradient(135deg, rgba(54,128,255,0.06) 0%, rgba(54,128,255,0.01) 100%)",
  },
  {
    icon: BookOpen,
    title: "Educational support",
    line: "Learn the rationale behind every idea.",
    bgGradient: "linear-gradient(135deg, rgba(54,128,255,0.07) 0%, rgba(54,128,255,0.02) 100%)",
  },
];

export function TrustBar() {
  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-surface py-8">
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 50% at 50% 50%, rgba(54,128,255,0.03) 0%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-max relative">
        <div
          className="reveal-group grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]"
        >
          {cards.map(({ icon: Icon, title, line, bgGradient }) => (
            <div
              key={title}
              className="card reveal group"
              style={{
                background: bgGradient,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "linear-gradient(90deg, var(--color-accent-gold), transparent)",
                  opacity: 0.5,
                }}
              />

              <div className="card-icon transition-transform duration-normal ease-out group-hover:scale-105">
                <Icon size={24} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)" }} />
              </div>
              <h3 className="mb-2 text-body-sm font-semibold text-text-primary">
                {title}
              </h3>
              <p className="m-0 text-body-sm leading-relaxed text-text-secondary">
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
