"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MessageCircle, Bell, BarChart3 } from "lucide-react";

const mockMessages = [
  { role: "analyst" as const, text: "XAU testing 2340. Watching for hold for a long.", time: "10:42" },
  { role: "member" as const, text: "Long from 2338, SL 2332. Cheers.", time: "10:48" },
  { role: "analyst" as const, text: "TP1 hit on 2345 long. Moving SL to breakeven.", time: "11:02" },
  { role: "member" as const, text: "Same. Letting the rest run to TP2.", time: "11:05" },
];

function CommunityMockup() {
  return (
    <div
      className="reveal-group"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "var(--space-2)",
      }}
    >
      {/* Chat panel */}
      <div
        className="reveal card"
        style={{ padding: 0, overflow: "hidden" }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <MessageCircle size={16} style={{ color: "var(--color-accent-gold)" }} strokeWidth={1.5} />
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>AIOV Capital</span>
        </div>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "200px" }}>
          {mockMessages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "analyst" ? "flex-start" : "flex-end" }}>
              <div
                style={{
                  maxWidth: "85%",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  background: msg.role === "analyst" ? "rgba(54,128,255,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${msg.role === "analyst" ? "rgba(54,128,255,0.15)" : "var(--color-border-subtle)"}`,
                }}
              >
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", margin: 0 }}>{msg.text}</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: "4px 0 0" }}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div className="reveal card" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div className="card-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
            <Bell size={16} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)" }} />
          </div>
          <div>
            <p className="label-eyebrow" style={{ marginBottom: "4px" }}>Market alert</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", margin: "0 0 4px" }}>XAU/USD long bias · Entry zone 2336–2340</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0 }}>SL 2330 · TP1 2348</p>
          </div>
        </div>
        <div className="reveal card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <BarChart3 size={14} style={{ color: "var(--color-accent-gold)" }} strokeWidth={1.5} />
            <span className="label-eyebrow">XAU/USD · 1H</span>
          </div>
          <div
            style={{
              height: "56px",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-accent-gold)" }}>2,347</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunitySection() {
  return (
    <section id="community" className="section-padding">
      <div className="container-max">
        <SectionHeading
          eyebrow="Community"
          title="Community & member experience"
          subtitle="Structured alerts, discussion, and market updates in one place"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
            alignItems: "center",
          }}
          className="lg:grid-cols-2"
        >
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
              AIOV Capital is more than trade ideas. Our community brings
              together active traders with market commentary, structured
              setups, and real-time discussion. You get access to analysts and
              a network of peers focused on gold and macro.
            </p>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
              The environment stays clean and professional—no spam, no hype.
              Just clear entry and exit levels, risk parameters, and support
              when you need it.
            </p>
          </div>
          <div className="reveal">
            <CommunityMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
