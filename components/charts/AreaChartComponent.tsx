"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaChartDataPoint {
  time: string;
  price: number;
}

interface AreaChartComponentProps {
  data: AreaChartDataPoint[];
  color?: string;
  height?: number;
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
          color: "#B8D4FF",
          fontSize: 14,
          fontWeight: 600,
          margin: "4px 0 0",
        }}
      >
        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function AreaChartComponent({
  data,
  color = "#3680FF",
  height = 400,
}: AreaChartComponentProps) {
  const gradientId = "area-chart-gradient";

  return (
    <div className="w-full min-h-[200px]" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
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
          domain={["auto", "auto"]}
          tickFormatter={(value: number) =>
            value.toLocaleString(undefined, { maximumFractionDigits: 0 })
          }
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(212, 175, 55, 0.2)" }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
}
