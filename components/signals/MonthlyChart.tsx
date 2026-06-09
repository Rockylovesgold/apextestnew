"use client";

import { useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { monthlyPerformance } from "@/lib/mockData";
import { TrendingUp } from "lucide-react";

export default function MonthlyChart() {
  const chartData = monthlyPerformance.map((mp) => ({
    month: mp.month.substring(0, 3),
    pips: mp.pips,
  }));

  const stats = useMemo(() => {
    const pipsValues = monthlyPerformance.map((mp) => mp.pips);
    const best = Math.max(...pipsValues);
    const total = pipsValues.reduce((sum, v) => sum + v, 0);
    const avg = Math.round(total / pipsValues.length);
    return { best, avg, total };
  }, []);

  const latestYear = monthlyPerformance[monthlyPerformance.length - 1].year;

  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#3680FF]" />
          <h3 className="font-heading text-2xl font-semibold text-white">
            Monthly Performance
          </h3>
        </div>
        <span className="font-data text-sm text-text-secondary">
          {latestYear - 1} &ndash; {latestYear}
        </span>
      </div>

      <div className="h-[400px]">
        <BarChartComponent data={chartData} />
      </div>

      <div className="flex flex-wrap justify-center gap-8 mt-8 pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="font-data text-2xl font-bold text-green-profit">
            +{stats.best}
          </p>
          <p className="font-body text-xs text-text-secondary uppercase tracking-wider mt-1">
            Best Month
          </p>
        </div>
        <div className="text-center">
          <p className="font-data text-2xl font-bold text-white">
            +{stats.avg}
          </p>
          <p className="font-body text-xs text-text-secondary uppercase tracking-wider mt-1">
            Average / Month
          </p>
        </div>
        <div className="text-center">
          <p className="font-data text-2xl font-bold text-[#3680FF]">
            +{stats.total.toLocaleString()}
          </p>
          <p className="font-body text-xs text-text-secondary uppercase tracking-wider mt-1">
            Total Pips
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
