"use client";

import { Smartphone, LayoutList, MousePointer2, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const bullets = [
  { icon: TrendingUp, text: "Advanced charting & analysis tools" },
  { icon: LayoutList, text: "One-click trade management" },
  { icon: MousePointer2, text: "Real-time execution" },
  { icon: Smartphone, text: "Desktop & mobile access" },
];

export function MT5PlatformSection() {
  return (
    <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="container-max">
        <SectionHeading
          eyebrow="Platform"
          title="Platform & execution"
          subtitle="Many members use MetaTrader 5—chart access, trade management, and execution in one place"
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
          <div
            className="reveal card"
            style={{
              aspectRatio: "4/3",
              maxWidth: "420px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(54,128,255,0.05) 0%, rgba(54,128,255,0.02) 100%)",
            }}
          >
            <svg
              viewBox="0 0 400 300"
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Platform window */}
              <rect x="20" y="20" width="360" height="260" fill="none" stroke="rgba(54,128,255,0.2)" strokeWidth="2" rx="4" />

              {/* Title bar */}
              <rect x="20" y="20" width="360" height="28" fill="rgba(54,128,255,0.08)" rx="4" />
              <text x="30" y="40" fontSize="10" fill="rgba(54,128,255,0.6)" fontWeight="500">
                XAU/USD — MetaTrader 5
              </text>

              {/* Left panel (instruments) */}
              <rect x="20" y="48" width="60" height="232" fill="rgba(54,128,255,0.03)" stroke="rgba(54,128,255,0.15)" strokeWidth="1" />
              <text x="28" y="65" fontSize="8" fill="rgba(54,128,255,0.5)">
                Instruments
              </text>
              <line x1="22" y1="72" x2="78" y2="72" stroke="rgba(54,128,255,0.1)" strokeWidth="0.5" />
              <text x="28" y="88" fontSize="7" fill="var(--color-accent-gold)" fontWeight="600">
                XAU/USD
              </text>
              <text x="28" y="102" fontSize="7" fill="rgba(54,128,255,0.5)">
                Gold
              </text>

              {/* Main chart area */}
              <rect x="80" y="48" width="220" height="232" fill="rgba(54,128,255,0.02)" stroke="rgba(54,128,255,0.1)" strokeWidth="1" />

              {/* Chart grid */}
              <defs>
                <pattern id="grid" width="22" height="29" patternUnits="userSpaceOnUse">
                  <path d="M 22 0 L 0 0 0 29" fill="none" stroke="rgba(54,128,255,0.08)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect x="82" y="50" width="216" height="228" fill="url(#grid)" />

              {/* Chart title & price */}
              <text x="95" y="65" fontSize="10" fill="var(--color-accent-gold)" fontWeight="600">
                2,347.82
              </text>
              <text x="95" y="78" fontSize="7" fill="rgba(54,128,255,0.5)">
                +1.25%
              </text>

              {/* Candlestick chart visualization */}
              <g>
                {/* Candle 1 */}
                <line x1="110" y1="100" x2="110" y2="140" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.4" />
                <rect x="106" y="115" width="8" height="18" fill="var(--color-accent-gold)" opacity="0.5" rx="1" />
                {/* Candle 2 */}
                <line x1="128" y1="95" x2="128" y2="145" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.4" />
                <rect x="124" y="105" width="8" height="25" fill="var(--color-accent-gold)" opacity="0.4" rx="1" />
                {/* Candle 3 */}
                <line x1="146" y1="105" x2="146" y2="135" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.4" />
                <rect x="142" y="112" width="8" height="20" fill="var(--color-accent-gold)" opacity="0.5" rx="1" />
                {/* Candle 4 */}
                <line x1="164" y1="90" x2="164" y2="150" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.4" />
                <rect x="160" y="100" width="8" height="35" fill="var(--color-accent-gold)" opacity="0.3" rx="1" />
                {/* Candle 5 */}
                <line x1="182" y1="110" x2="182" y2="130" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.4" />
                <rect x="178" y="118" width="8" height="10" fill="var(--color-accent-gold)" opacity="0.4" rx="1" />
              </g>

              {/* Trend line */}
              <polyline
                points="110,130 128,115 146,125 164,100 182,120"
                fill="none"
                stroke="var(--color-accent-gold)"
                strokeWidth="1.5"
                opacity="0.3"
              />

              {/* Right panel (info) */}
              <rect x="300" y="48" width="80" height="232" fill="rgba(54,128,255,0.03)" stroke="rgba(54,128,255,0.15)" strokeWidth="1" />
              <text x="308" y="65" fontSize="8" fill="rgba(54,128,255,0.5)">
                Orders
              </text>
              <line x1="302" y1="72" x2="378" y2="72" stroke="rgba(54,128,255,0.1)" strokeWidth="0.5" />

              {/* Order entry example */}
              <rect x="308" y="85" width="64" height="12" fill="rgba(54,128,255,0.1)" rx="2" />
              <text x="312" y="94" fontSize="6" fill="rgba(54,128,255,0.7)" fontWeight="500">
                BUY 0.5
              </text>

              <rect x="308" y="102" width="64" height="12" fill="rgba(54,128,255,0.08)" rx="2" />
              <text x="312" y="111" fontSize="6" fill="rgba(54,128,255,0.6)">
                TP: 2,380
              </text>

              <rect x="308" y="119" width="64" height="12" fill="rgba(54,128,255,0.08)" rx="2" />
              <text x="312" y="128" fontSize="6" fill="rgba(54,128,255,0.6)">
                SL: 2,320
              </text>
            </svg>
          </div>

          <div
            className="reveal-group"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            {bullets.map(({ icon: Icon, text }) => (
              <div key={text} className="card reveal" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px" }}>
                <div style={{ flexShrink: 0, opacity: 0.8 }}>
                  <Icon size={20} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)" }} />
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
