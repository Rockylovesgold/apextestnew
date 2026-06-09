"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BarChartDataPoint {
  month: string;
  pips: number;
}

interface BarChartComponentProps {
  data: BarChartDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  const isPositive = value >= 0;

  return (
    <div
      style={{
        background: "#12121E",
        border: "1px solid rgba(212, 175, 55, 0.4)",
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <p style={{ color: "#8A8A9A", fontSize: 12, margin: 0 }}>{label}</p>
      <p
        style={{
          color: isPositive ? "#00E676" : "#FF1744",
          fontSize: 14,
          fontWeight: 600,
          margin: "4px 0 0",
        }}
      >
        {isPositive ? "+" : ""}
        {value} pips
      </p>
    </div>
  );
}

export default function BarChartComponent({ data }: BarChartComponentProps) {
  return (
    <div className="w-full min-h-[300px]" style={{ height: 400 }}>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="#8A8A9A"
          tick={{ fill: "#8A8A9A", fontSize: 12 }}
          axisLine={{ stroke: "#8A8A9A" }}
          tickLine={{ stroke: "#8A8A9A" }}
        />
        <YAxis
          stroke="#8A8A9A"
          tick={{ fill: "#8A8A9A", fontSize: 12 }}
          axisLine={{ stroke: "#8A8A9A" }}
          tickLine={{ stroke: "#8A8A9A" }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
        <Bar dataKey="pips" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.pips >= 0 ? "#00E676" : "#FF1744"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
