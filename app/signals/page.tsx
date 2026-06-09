"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldButton } from "@/components/ui/GoldButton";
import { StatCounter } from "@/components/ui/StatCounter";
import SignalTable from "@/components/signals/SignalTable";
import MonthlyChart from "@/components/signals/MonthlyChart";
import { signals } from "@/lib/mockData";

const pairFilters = [
  "All",
  ...Array.from(new Set(signals.map((s) => s.pair))).sort(),
];

export default function SignalsPage() {
  const [pairFilter, setPairFilter] = useState<string>("All");

  // Show only the 15 most recent as examples
  const filteredSignals = useMemo(() => {
    const base =
      pairFilter === "All"
        ? signals
        : signals.filter((s) => s.pair === pairFilter);
    return base.slice(0, 15);
  }, [pairFilter]);

  const stats = useMemo(() => {
    const all = pairFilter === "All" ? signals : signals.filter((s) => s.pair === pairFilter);
    const closedAll = all.filter((s) => s.status === "won" || s.status === "lost");
    const wonAll = all.filter((s) => s.status === "won");
    const winRate = closedAll.length > 0 ? Math.round((wonAll.length / closedAll.length) * 100) : 0;
    return { winRate };
  }, [pairFilter]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      {/* Hero */}
      <section className="section-padding" style={{ paddingTop: "8rem", paddingBottom: "3rem" }}>
        <div className="container-max">
          <SectionHeading
            eyebrow="Live Signals — Every Day"
            title="Trade History & Ideas"
            subtitle="8–10 gold trading opportunities delivered every single day — entry zones, stop loss, and take-profit levels."
          />
          {/* Example disclaimer */}
          <div
            style={{
              marginTop: "20px",
              padding: "14px 20px",
              borderRadius: "var(--radius-md)",
              background: "rgba(54,128,255,0.06)",
              border: "1px solid rgba(54,128,255,0.16)",
              maxWidth: "680px",
            }}
          >
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", margin: 0, lineHeight: "var(--leading-relaxed)" }}>
              <span style={{ color: "var(--color-accent-gold)", fontWeight: 600 }}>Example trade ideas only.</span>{" "}
              The signals below are illustrative examples of the type of setups we share daily in our Telegram community. Past performance is not indicative of future results. This is not financial advice.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding container-max" style={{ paddingTop: 0 }}>
        <div
          className="reveal-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
            gap: "var(--space-3)",
            marginBottom: "var(--space-8)",
          }}
        >
          <div className="card reveal" style={{ textAlign: "center" }}>
            <StatCounter target={stats.winRate} suffix="%" label="Reported Win Rate" />
          </div>
          <div className="card reveal" style={{ textAlign: "center" }}>
            <StatCounter target={20} suffix="+" label="Years Experience" />
          </div>
          <div className="card reveal" style={{ textAlign: "center" }}>
            <StatCounter target={20000} prefix="+" label="Avg Pips Per Month" />
          </div>
          <div className="card reveal" style={{ textAlign: "center" }}>
            <StatCounter target={8} suffix="–10" label="Daily Signals" />
          </div>
        </div>

        {/* Pair filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {pairFilters.map((pair) => (
            <button
              key={pair}
              onClick={() => setPairFilter(pair)}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: pairFilter === pair ? "1px solid transparent" : "1px solid var(--color-border-subtle)",
                background: pairFilter === pair ? "var(--color-accent-gold)" : "transparent",
                color: pairFilter === pair ? "var(--color-bg-base)" : "var(--color-text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                if (pairFilter !== pair) {
                  (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (pairFilter !== pair) {
                  (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-subtle)";
                }
              }}
            >
              {pair}
            </button>
          ))}
        </div>

        {/* Signal Table — example entries */}
        <div className="reveal" style={{ marginBottom: "var(--space-8)" }}>
          <SignalTable signals={filteredSignals} />
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "12px", textAlign: "center" }}>
            Showing 15 example trade ideas. Live signals are shared exclusively in our Telegram community daily.
          </p>
        </div>

        {/* Monthly Chart */}
        <div className="card reveal" style={{ marginBottom: "var(--space-8)" }}>
          <MonthlyChart />
        </div>

        {/* CTA */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: "6rem" }}>
          <GoldButton variant="primary" href="/contact" showArrow>
            Get Live Signals Daily
          </GoldButton>
        </div>
      </section>
    </main>
  );
}
