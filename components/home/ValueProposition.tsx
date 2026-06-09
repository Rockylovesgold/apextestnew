"use client";

import { Clock, TrendingUp, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LucideIcon } from "lucide-react";

interface ValueCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const valueCards: ValueCard[] = [
  {
    icon: Clock,
    title: "20 Years of Professional Experience",
    description:
      "Built on 20 years of experience across cryptocurrency and gold (XAU/USD) markets, operating between Dubai and the UK. We focus on what works in real conditions.",
  },
  {
    icon: TrendingUp,
    title: "86% Success Rate on Gold Signals",
    description:
      "Specialising in gold (XAU/USD). A reported 86% success rate on shared trade ideas with real-time market analysis and clear setups — not noise.",
  },
  {
    icon: Users,
    title: "Private Telegram Community",
    description:
      "Join a growing community of traders via our private Telegram group. Live signals, market commentary, and peer support — all in one place.",
  },
];

export function ValueProposition() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <SectionHeading
          eyebrow="Why AIOV Capital"
          title="20+ Years Trading Experience and Market Focus"
          subtitle="Credibility and clarity at the core of what we offer"
        />

        <div className="reveal-group feature-grid">
          {valueCards.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="card reveal"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="card-icon">
                <Icon size={20} strokeWidth={1.5} style={{ color: "var(--color-text-secondary)" }} />
              </div>
              <h3 style={{ marginBottom: "12px" }}>{title}</h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--leading-relaxed)",
                  margin: 0,
                }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
