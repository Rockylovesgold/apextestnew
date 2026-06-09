"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import SparklineChart from "@/components/charts/SparklineChart";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import type { Instrument } from "@/lib/mockData";

interface InstrumentCardProps {
  instrument: Instrument;
  selected: boolean;
  onClick: () => void;
}

export default function InstrumentCard({
  instrument,
  selected,
  onClick,
}: InstrumentCardProps) {
  const isPositive = instrument.changePercent >= 0;

  return (
    <GlassCard
      className={cn(
        "cursor-pointer transition-all duration-300",
        selected && "border border-[#3680FF]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
      )}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-body text-sm text-text-secondary">
            {instrument.flag} {instrument.name}
          </span>
          <p className="font-data text-lg font-bold text-white">
            {instrument.symbol}
          </p>
        </div>
        <span
          className={cn(
            "font-data text-sm font-semibold px-2 py-0.5 rounded-full",
            isPositive
              ? "text-green-profit bg-green-profit/10"
              : "text-red-loss bg-red-loss/10"
          )}
        >
          {formatPercentage(instrument.changePercent)}
        </span>
      </div>

      <div className="mb-3">
        <span className="font-data text-3xl font-bold text-white">
          {formatCurrency(instrument.price)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="font-data text-xs text-text-secondary">
          H: {formatCurrency(instrument.high24h)}
        </span>
        <span className="font-data text-xs text-text-secondary">
          L: {formatCurrency(instrument.low24h)}
        </span>
      </div>

      <div className="flex justify-center">
        <SparklineChart
          data={instrument.sparklineData}
          positive={isPositive}
          width={160}
          height={48}
        />
      </div>
    </GlassCard>
  );
}
