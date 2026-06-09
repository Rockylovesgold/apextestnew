"use client";

import Image from "next/image";
import { GoldButton } from "@/components/ui/GoldButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { signals, type Signal } from "@/lib/mockData";
import { formatPips } from "@/lib/utils";

export function SignalPreview() {
  const displayedSignals = signals.slice(0, 6);

  function renderTpCell(price: number, hit: boolean, status: Signal["status"]) {
    if (status === "lost") {
      return (
        <span className="text-text-primary font-data">
          {price} <span className="text-red-loss">&#10060;</span>
        </span>
      );
    }
    if (hit) {
      return (
        <span className="text-text-primary font-data">
          {price} <span className="text-green-profit">&#9989;</span>
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="text-text-primary font-data">
          {price} <span>&#9203;</span>
        </span>
      );
    }
    return <span className="text-text-primary font-data">{price}</span>;
  }

  const cardSignals = signals.slice(0, 3);

  return (
    <section
      className="section-padding"
      style={{ background: "var(--color-bg-surface)" }}
    >
      <div className="container-max">
        <SectionHeading
          eyebrow="Trade Ideas"
          title="Daily trade setups"
          subtitle="Structured ideas with entry zone, stop loss, and take-profit levels—for illustration only"
        />

        {/* Trade cards */}
        <div
          className="reveal-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-3)",
            marginBottom: "var(--space-5)",
          }}
        >
          {cardSignals.map((signal) => (
            <div
              key={signal.id}
              className="card reveal"
              style={{
                borderLeft: `3px solid ${signal.direction === "BUY" ? "var(--color-positive)" : "var(--color-negative)"}`,
                fontFamily: "var(--font-mono)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>{signal.pair}</span>
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    background: signal.direction === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    color: signal.direction === "BUY" ? "var(--color-positive)" : "var(--color-negative)",
                  }}
                >
                  {signal.direction}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-sm)" }}>
                <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-text-primary)" }}>Entry:</span>{" "}
                  {signal.entry.toFixed(signal.entry < 100 ? 2 : 1)}
                </p>
                <p style={{ margin: 0, color: "var(--color-negative)" }}>
                  SL: {signal.stopLoss.toFixed(signal.stopLoss < 100 ? 2 : 1)}
                </p>
                <p style={{ margin: 0, color: "var(--color-positive)" }}>
                  TP1: {signal.tp1.toFixed(signal.tp1 < 100 ? 2 : 1)}{signal.tp1Hit && " ✓"}
                </p>
                <p style={{ margin: 0, color: "var(--color-positive)" }}>
                  TP2: {signal.tp2.toFixed(signal.tp2 < 100 ? 2 : 1)}{signal.tp2Hit && " ✓"}
                </p>
                <p style={{ margin: 0, color: "var(--color-positive)" }}>
                  TP3: {signal.tp3.toFixed(signal.tp3 < 100 ? 2 : 1)}{signal.tp3Hit && " ✓"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="reveal data-table" style={{ overflowX: "auto", borderLeft: "3px solid var(--color-positive)" }}>
          <div style={{ minWidth: "760px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Pair", "Direction", "Entry", "SL", "TP1", "TP2", "TP3", "Result", "Pips"].map((h) => (
                    <th key={h} style={{ textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedSignals.map((signal) => (
                  <tr key={signal.id}>
                    <td>{signal.date}</td>
                    <td style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{signal.pair}</td>
                    <td style={{ color: signal.direction === "BUY" ? "var(--color-positive)" : "var(--color-negative)", fontWeight: 700 }}>{signal.direction}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{signal.entry}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{signal.stopLoss}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{renderTpCell(signal.tp1, signal.tp1Hit, signal.status)}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{renderTpCell(signal.tp2, signal.tp2Hit, signal.status)}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{renderTpCell(signal.tp3, signal.tp3Hit, signal.status)}</td>
                    <td style={{ fontSize: "var(--text-xs)" }}>{signal.result}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: signal.pips >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}>{formatPips(signal.pips)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px", background: "var(--color-bg-elevated)", borderTop: "1px solid var(--color-border-subtle)" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", margin: 0 }}>
                Example history. Past performance is not indicative of future results. See{" "}
                <a href="/legal" style={{ color: "var(--color-accent-gold)", textDecoration: "none" }}>Legal &amp; Risk</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Real results screenshots */}
        <div
          className="reveal-group"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-2)",
            marginTop: "var(--space-5)",
          }}
        >
          <div
            className="reveal card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "12px",
              background: "linear-gradient(135deg, rgba(54,128,255,0.08) 0%, rgba(54,128,255,0.02) 100%)",
            }}
          >
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Live results
            </p>
            <p style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-accent-gold)", fontFamily: "var(--font-mono)", margin: 0 }}>
              90%
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
              Reported success rate across all shared trade ideas in our private Telegram community.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-5)" }}>
          <GoldButton variant="secondary" href="/signals" showArrow>
            View trade ideas
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
