"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldButton } from "@/components/ui/GoldButton";
import { useState } from "react";
import { ChevronDown, MessageCircle, BarChart3, BookOpen, Bell, Users, Shield } from "lucide-react";

const benefits = [
  {
    icon: BarChart3,
    title: "Market insights",
    description:
      "Structured analysis on gold, macro, and key markets. Clear levels and context, not noise.",
  },
  {
    icon: MessageCircle,
    title: "Trade ideas & discussion",
    description:
      "Share and discuss setups in a professional environment. Trade ideas are clearly labelled as such, not as advice.",
  },
  {
    icon: Bell,
    title: "Alerts & updates",
    description:
      "Receive alerts and session updates so you can stay aligned with the community and market flow.",
  },
  {
    icon: BookOpen,
    title: "Educational resources",
    description:
      "Access to guides on risk management, execution, and platform use. Build skills, not dependency.",
  },
  {
    icon: Users,
    title: "Community access",
    description:
      "Join a focused group of serious traders. No spam, no hype—structured discussion and support.",
  },
  {
    icon: Shield,
    title: "Transparent approach",
    description:
      "We emphasise discipline, risk management, and clear communication. No guaranteed results—clear expectations.",
  },
];

const faqs = [
  {
    q: "How do I receive ideas and alerts?",
    a: "Members receive ideas and session updates via our private channel. Format and frequency are set out when you join.",
  },
  {
    q: "Is this suitable for beginners?",
    a: "The community and education resources are designed to support a range of experience levels. We emphasise risk management and education. Trading always carries risk—beginners should especially ensure they understand the risks before trading.",
  },
  {
    q: "Are there any guarantees?",
    a: "No. We do not guarantee results. Trade ideas and discussion are for information and education only. You are responsible for your own trading decisions. See our Legal & Risk page for full disclosure.",
  },
];

export default function CommunityPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ minHeight: "100vh" }}>
      <section className="section-padding" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
        <div className="container-max">
          <SectionHeading
            eyebrow="Community"
            title="Community & Membership"
            subtitle="What members get: market insights, trade ideas, education, and a high-trust environment."
          />
        </div>
      </section>

      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container-max">
          {/* Benefits Grid */}
          <div
            className="reveal-group"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--space-3)",
            }}
          >
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card reveal" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="card-icon">
                    <Icon size={20} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)" }} />
                  </div>
                  <h3 style={{ marginBottom: "10px" }}>{item.title}</h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0, flex: 1 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Onboarding Overview */}
          <div
            className="reveal"
            style={{
              marginTop: "var(--space-10)",
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border-subtle)",
              background: "var(--color-bg-elevated)",
            }}
          >
            <h3 style={{ marginBottom: "16px" }}>Onboarding overview</h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "24px" }}>
              Access to the community is granted after a simple onboarding
              process. We do not lead with broker signup or referral
              requirements on the main journey. You can learn about platform
              compatibility and execution tools in the Education and Platform
              sections. If a broker or platform is relevant to your
              participation, it will be explained in context—not as the
              primary brand story.
            </p>
            <GoldButton variant="primary" href="/contact" showArrow>
              Get Access
            </GoldButton>
          </div>

          {/* FAQs */}
          <div style={{ marginTop: "var(--space-10)" }}>
            <h3 style={{ marginBottom: "32px" }}>FAQs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "20px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "16px",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "var(--text-base)" }}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--color-accent-gold)",
                        flexShrink: 0,
                        transition: "transform var(--transition-base)",
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <div
                    className="accordion-answer"
                    style={{ maxHeight: openFaq === i ? "400px" : "0" }}
                  >
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", paddingBottom: "20px", margin: 0 }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
