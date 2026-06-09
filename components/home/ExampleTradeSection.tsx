"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Example levels for XAU/USD (from spec: Entry gold, SL red, TP1–3 green)
const ENTRY = 2341.5;
const STOP_LOSS = 2335;
const TP1 = 2348;
const TP2 = 2355;
const TP3 = 2362;

function generateChartData() {
  const points = [];
  let price = 2332;
  for (let i = 0; i <= 24; i++) {
    if (i < 6) price += 2;
    else if (i < 10) price -= 1.5;
    else if (i < 16) price += 3;
    else if (i < 20) price += 1;
    else price -= 0.5;
    points.push({ index: i, price: Math.round(price * 10) / 10 });
  }
  return points;
}

export function ExampleTradeSection() {
  const data = useMemo(() => generateChartData(), []);

  return (
    <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
      <div className="container-max">
        <SectionHeading
          eyebrow="Example Setup"
          title="Example Trade Setup"
          subtitle="Entry, stop loss, and take-profit levels on a live-style chart"
        />
        <div className="reveal card" style={{ overflow: "hidden", padding: "var(--space-4)" }}>
            <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "var(--text-sm)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-accent-gold)" }} />
                Entry zone
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-negative)" }} />
                Stop loss
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-positive)" }} />
                Take profit 1–3
              </span>
            </div>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={data}
                  margin={{ top: 16, right: 16, bottom: 0, left: 16 }}
                >
                  <defs>
                    <linearGradient
                      id="example-trade-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3680FF"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#3680FF"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="index"
                    stroke="#8A8A9A"
                    tick={{ fill: "#8A8A9A", fontSize: 11 }}
                    axisLine={{ stroke: "#8A8A9A" }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8A8A9A"
                    tick={{ fill: "#8A8A9A", fontSize: 11 }}
                    axisLine={{ stroke: "#8A8A9A" }}
                    tickLine={false}
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickFormatter={(v: number) =>
                      v.toLocaleString(undefined, { maximumFractionDigits: 1 })
                    }
                  />
                  <ReferenceLine
                    y={ENTRY}
                    stroke="#3680FF"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  >
                    <Label
                      value="Entry"
                      position="right"
                      fill="#3680FF"
                      fontSize={11}
                      fontFamily="var(--font-outfit), sans-serif"
                    />
                  </ReferenceLine>
                  <ReferenceLine
                    y={STOP_LOSS}
                    stroke="#FF1744"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  >
                    <Label
                      value="SL"
                      position="right"
                      fill="#FF1744"
                      fontSize={11}
                      fontFamily="var(--font-outfit), sans-serif"
                    />
                  </ReferenceLine>
                  <ReferenceLine y={TP1} stroke="#00E676" strokeWidth={1.5}>
                    <Label
                      value="TP1"
                      position="right"
                      fill="#00E676"
                      fontSize={10}
                      fontFamily="var(--font-outfit), sans-serif"
                    />
                  </ReferenceLine>
                  <ReferenceLine y={TP2} stroke="#00E676" strokeWidth={1.5}>
                    <Label
                      value="TP2"
                      position="right"
                      fill="#00E676"
                      fontSize={10}
                      fontFamily="var(--font-outfit), sans-serif"
                    />
                  </ReferenceLine>
                  <ReferenceLine y={TP3} stroke="#00E676" strokeWidth={1.5}>
                    <Label
                      value="TP3"
                      position="right"
                      fill="#00E676"
                      fontSize={10}
                      fontFamily="var(--font-outfit), sans-serif"
                    />
                  </ReferenceLine>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3680FF"
                    strokeWidth={2}
                    fill="url(#example-trade-gradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    </section>
  );
}
