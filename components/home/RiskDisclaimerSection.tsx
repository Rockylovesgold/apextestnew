"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";

const shortText =
  "Trading gold and forex carries significant risk. Many retail accounts lose money trading CFDs. Past performance is not indicative of future results. This is not financial advice.";

const fullText = [
  "Trading gold, forex, and other leveraged products carries a high level of risk and may not be suitable for all investors. You could lose all or more than your initial investment.",
  "71–80% of retail investor accounts lose money when trading CFDs. Past performance is not indicative of future results. The content on this site is for information and education only and does not constitute financial advice.",
  "You should ensure you fully understand the risks and seek independent advice if necessary. AIOV Capital may have third-party or affiliate relationships; see our Legal & Risk page for details.",
].join(" ");

export function RiskDisclaimerSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className="section-padding reveal"
      style={{ background: "var(--color-bg-surface)" }}
    >
      <div className="container-max">
        <div style={{ maxWidth: "var(--max-width-narrow)", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div className="card-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
                <AlertTriangle size={18} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)", opacity: 0.7 }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                  {shortText}
                </p>
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "12px",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-accent-gold)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {expanded ? "Show less" : "Read full disclaimer"}
                  <ChevronDown
                    size={14}
                    className="accordion-chevron"
                    style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 300ms ease" }}
                  />
                </button>
                <div
                  className="accordion-answer"
                  style={expanded ? { maxHeight: "800px", paddingBottom: "var(--space-3)" } : undefined}
                >
                  <p
                    style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--color-border-subtle)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-secondary)",
                      lineHeight: "var(--leading-relaxed)",
                      margin: "16px 0 0",
                    }}
                  >
                    {fullText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
