"use client";

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Join the community",
    description: "Get access to the AIOV Capital community and receive trade ideas, market updates, and educational content.",
  },
  {
    number: "02",
    title: "Review setups and updates",
    description: "Review daily trade setups, entry zones, stop loss and take-profit levels, and market commentary.",
  },
  {
    number: "03",
    title: "Execute with discipline",
    description: "Apply your own risk management. Use your preferred platform to execute; we focus on structure and clarity.",
  },
  {
    number: "04",
    title: "Keep learning",
    description: "Use the community and resources to improve your analysis and execution over time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="container-max">
        <SectionHeading
          eyebrow="The Process"
          title="How it works"
          subtitle="From joining to execution — a simple, transparent process inside one connected ecosystem"
        />

        <div
          className="reveal"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "720px",
            margin: "0 auto var(--space-8)",
            aspectRatio: "1 / 1",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid rgba(54,128,255,0.20)",
            background: "linear-gradient(160deg, #0C132A 0%, #070C1C 100%)",
            boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(54,128,255,0.08) inset",
          }}
        >
          <Image
            src="/brand/aiov-ecosystem.jpg"
            alt="The AIOV Capital ecosystem — team, mission, and structure"
            fill
            sizes="(max-width: 720px) 100vw, 720px"
            style={{ objectFit: "contain" }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent 0%, rgba(54,128,255,0.7) 50%, transparent 100%)",
            }}
          />
        </div>

        <div
          className="reveal-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {steps.map((step) => (
            <div key={step.title} className="card reveal" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="process-step-number">{step.number}</div>
              <h3 style={{ marginBottom: "6px" }}>{step.title}</h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--leading-relaxed)",
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
