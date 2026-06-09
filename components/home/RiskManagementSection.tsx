"use client";

import { Shield, Scale, PiggyBank } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LucideIcon } from "lucide-react";

const cards: { icon: LucideIcon; title: string; description: string; accentColor: string }[] = [
  {
    icon: Shield,
    title: "Stop losses on every trade",
    description:
      "Every signal includes a defined stop loss. We never leave positions open without a clear risk level, protecting your capital from unexpected moves.",
    accentColor: "#3680FF",
  },
  {
    icon: Scale,
    title: "Position sizing discipline",
    description:
      "We emphasise consistent position sizing and risk per trade. Our guidelines help you size positions according to your account and risk tolerance.",
    accentColor: "#3680FF",
  },
  {
    icon: PiggyBank,
    title: "Controlled risk exposure",
    description:
      "Diversification and limits on concurrent exposure keep risk manageable. We focus on sustainable growth rather than outsized, reckless bets.",
    accentColor: "#D4B959",
  },
];

export function RiskManagementSection() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <SectionHeading
          eyebrow="Risk Management"
          title="Risk Management Principles"
          subtitle="Structured and disciplined approach to protecting your capital"
        />
        <div className="reveal-group feature-grid">
          {cards.map(({ icon: Icon, title, description, accentColor }) => (
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
              {/* Accent border left */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "3px",
                  background: accentColor,
                  opacity: 0.5,
                }}
              />

              {/* Background glow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <div className="card-icon" style={{ position: "relative", zIndex: 1 }}>
                <Icon size={24} strokeWidth={1.5} style={{ color: accentColor }} />
              </div>
              <h3 style={{ marginBottom: "12px", position: "relative", zIndex: 1 }}>{title}</h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--leading-relaxed)",
                  margin: 0,
                  flex: 1,
                  position: "relative",
                  zIndex: 1,
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
