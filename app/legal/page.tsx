"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { AlertTriangle } from "lucide-react";
import { PageAccents } from "@/components/layout/PageAccents";

const sections = [
  {
    title: "No Financial Advice",
    body: "AIOV Capital and any content or communications from us are for informational and educational purposes only. Nothing we provide constitutes financial, investment, tax, or legal advice. You should seek advice from an authorised financial adviser before making any investment or trading decision. We are not regulated to provide financial advice.",
  },
  {
    title: "High Risk Warning",
    body: "Trading gold, forex, CFDs, and other leveraged products carries significant risk. A high proportion of retail investor accounts lose money when trading these instruments. Past performance, including any reported win rates or results, is not indicative of future results. You may lose some or all of your invested capital. Only trade with money you can afford to lose and ensure you fully understand the risks involved.",
  },
  {
    title: "Third-Party Services & Affiliates",
    body: "We may refer to or link to third-party brokers, platforms, or services. Such references do not constitute an endorsement. We may have commercial arrangements with some of these parties. Any broker or platform you use is a separate legal entity and you are responsible for your own due diligence and for reading their terms, risk disclosures, and regulatory status. Independent signal providers or community content may be referenced; we are not responsible for third-party claims or performance.",
  },
  {
    title: "Use of Our Community & Content",
    body: "Access to our community, trade ideas, or educational content does not create a client or advisory relationship. You are solely responsible for your trading decisions and their outcomes. We do not guarantee the accuracy, completeness, or suitability of any information provided.",
  },
];

export default function LegalPage() {
  return (
    <main style={{ minHeight: "100vh", paddingTop: "8rem", paddingBottom: "6rem", position: "relative" }}>
      <PageAccents />
      <div className="section-padding container-max" style={{ position: "relative", zIndex: 2 }}>
        <SectionHeading
          eyebrow="Legal"
          title="Legal & Risk Disclosure"
          subtitle="Important information about our services and the risks involved"
        />

        <div className="reveal-group" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* First section with warning icon */}
          <div className="card reveal" style={{ display: "flex", gap: "16px" }}>
            <AlertTriangle
              size={28}
              strokeWidth={1.5}
              style={{ color: "var(--color-accent-gold)", flexShrink: 0, marginTop: "2px" }}
              aria-hidden
            />
            <div>
              <h2 style={{ marginBottom: "16px" }}>{sections[0].title}</h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                {sections[0].body}
              </p>
            </div>
          </div>

          {/* Remaining sections */}
          {sections.slice(1).map((s) => (
            <div key={s.title} className="card reveal">
              <h2 style={{ marginBottom: "16px" }}>{s.title}</h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}

          {/* Footer note */}
          <div className="reveal" style={{ paddingTop: "16px", borderTop: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
              This page forms part of our legal and regulatory disclosure. For
              full terms of use, privacy, and cookies, please see the relevant
              policy pages. If you have questions, contact us before relying on
              any of our content or joining the community.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
