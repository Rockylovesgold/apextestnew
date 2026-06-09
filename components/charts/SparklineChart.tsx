"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface SparklineChartProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export default function SparklineChart({
  data,
  positive,
  width = 120,
  height = 40,
}: SparklineChartProps) {
  // Use line thickness and opacity to differentiate, not color
  const strokeColor = "var(--color-accent-gold)";
  const strokeOpacity = positive ? 0.9 : 0.45;
  const strokeWidth = positive ? 1.75 : 1.25;
  const strokeDash = positive ? "none" : "3 3";
  const gradientId = `sparkline-gradient-${positive ? "up" : "down"}`;

  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div style={{ width, height, minWidth: width, minHeight: height }}>
      <ResponsiveContainer width={width} height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={positive ? 0.2 : 0.06} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={strokeOpacity}
            strokeDasharray={strokeDash}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
