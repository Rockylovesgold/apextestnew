"use client";

import { cn } from "@/lib/utils";
import { instruments } from "@/lib/mockData";

function TickerItem({
  symbol,
  price,
  changePercent,
}: {
  symbol: string;
  price: number;
  changePercent: number;
}) {
  const isPositive = changePercent >= 0;

  return (
    <div className="flex items-center gap-3 px-6 whitespace-nowrap">
      <span className="font-body text-sm text-text-secondary">{symbol}</span>
      <span className="font-data text-sm text-white font-medium">
        {price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span
        className={cn(
          "font-data text-xs font-medium",
          isPositive ? "text-green-profit" : "text-red-loss"
        )}
      >
        {isPositive ? "+" : ""}
        {changePercent.toFixed(2)}%
      </span>
    </div>
  );
}

export function PriceTicker() {
  return (
    <div className="w-full overflow-hidden bg-[#0C0C14]/80 border-y border-[#3680FF]/10 py-3 group">
      <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
        {instruments.map((instrument) => (
          <TickerItem
            key={`ticker-1-${instrument.symbol}`}
            symbol={instrument.symbol}
            price={instrument.price}
            changePercent={instrument.changePercent}
          />
        ))}
        {instruments.map((instrument) => (
          <TickerItem
            key={`ticker-2-${instrument.symbol}`}
            symbol={instrument.symbol}
            price={instrument.price}
            changePercent={instrument.changePercent}
          />
        ))}
      </div>
    </div>
  );
}
