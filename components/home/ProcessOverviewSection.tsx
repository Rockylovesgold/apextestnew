"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  { number: "01", title: "Join community", description: "Get access to our Telegram community and market discussions." },
  { number: "02", title: "Open trading account", description: "Create your account with our partner broker; minimum deposit applies." },
  { number: "03", title: "Follow trade setups", description: "Receive daily signals with entry, stop loss, and take-profit levels." },
  { number: "04", title: "Manage positions", description: "Copy signals into MetaTrader 5 and manage risk with our guidelines." },
];

export function ProcessOverviewSection() {
  return (
    <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="container-max">
        <SectionHeading
          eyebrow="Process"
          title="How The Process Works"
          subtitle="From joining to managing your trades in four steps"
        />
        <div
          className="reveal-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {steps.map((step) => (
            <div key={step.title} className="card reveal" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div className="process-step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
