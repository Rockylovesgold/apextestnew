"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldButton } from "@/components/ui/GoldButton";
import SparklineChart from "@/components/charts/SparklineChart";
import { instruments } from "@/lib/mockData";
import { useLiveInstruments } from "@/hooks/useLiveInstruments";
import { formatCurrency, formatPercentage } from "@/lib/utils";

export function MarketOverview() {
  const liveInstruments = useLiveInstruments(instruments);

  return (
    <section id="markets" className="section-padding">
      <div className="container-max">
        <SectionHeading
          eyebrow="Markets"
          title="Markets We Cover"
          subtitle="XAU/USD and BTC/USD — gold and Bitcoin. Premium market analysis on the two markets we focus on."
        />

        <div
          className="reveal-group grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
        >
          {liveInstruments.map((instrument) => {
            const isPositive = instrument.changePercent > 0;
            return (
              <div
                key={instrument.symbol}
                className="card reveal group flex flex-col gap-2"
              >
                {/* Symbol row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-label text-text-tertiary">
                      {instrument.flag}
                    </span>
                    <span className="font-mono text-body-sm text-text-secondary">
                      {instrument.symbol}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: `1px solid var(--color-border-${isPositive ? 'emphasis' : 'default'})`,
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      opacity: isPositive ? 1 : 0.7,
                    }}
                  >
                    {formatPercentage(instrument.changePercent)}
                  </span>
                </div>

                {/* Price */}
                <div className="stat-number text-[1.75rem] transition-opacity duration-normal group-hover:opacity-80">
                  {formatCurrency(instrument.price)}
                </div>

                {/* Sparkline */}
                <div className="opacity-95 transition-opacity duration-normal group-hover:opacity-100">
                  <SparklineChart
                    data={instrument.sparklineData}
                    positive={isPositive}
                    width={200}
                    height={48}
                  />
                </div>

                <div className="mt-auto pt-2">
                  <GoldButton variant="ghost" href="/markets" size="sm">
                    View XAU &amp; BTC →
                  </GoldButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
