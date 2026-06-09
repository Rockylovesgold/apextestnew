"use client";

import { Shield, BarChart3, Scale, FileCheck } from "lucide-react";
import { GoldButton } from "@/components/ui/GoldButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LucideIcon } from "lucide-react";

const cards: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: BarChart3,
    title: "Market structure",
    description: "Understand key levels, order flow, and how gold and macro markets move.",
  },
  {
    icon: FileCheck,
    title: "Execution discipline",
    description: "Plan entries, exits, and follow-through without emotional override.",
  },
  {
    icon: Scale,
    title: "Position sizing",
    description: "Size positions and allocate capital in line with your risk tolerance.",
  },
  {
    icon: Shield,
    title: "Risk management",
    description: "Stop loss, drawdown limits, and capital protection as a priority.",
  },
];

export function EducationPreview() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <SectionHeading
          eyebrow="Education"
          title="Education & risk management"
          subtitle="Structured learning on markets, execution, and risk—responsible and premium"
        />

        <div
          className="reveal-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {cards.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card reveal" style={{ display: "flex", flexDirection: "column" }}>
              <div className="card-icon">
                <Icon size={18} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)" }} />
              </div>
              <h3 style={{ marginBottom: "8px" }}>{title}</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0, flex: 1 }}>
                {description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>
          <GoldButton variant="secondary" href="/education" showArrow>
            Explore education
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
