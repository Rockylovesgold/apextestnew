"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Instrument } from "@/lib/mockData";

interface LiveQuote {
  symbol: "XAU/USD" | "BTC/USD";
  price: number;
  high24h: number;
  low24h: number;
  change: number;
  changePercent: number;
}

interface LiveResponse {
  quotes?: LiveQuote[];
}

function blendSparkline(base: number[], nextPrice: number): number[] {
  if (!base.length) return [nextPrice];
  const out = [...base];
  out[out.length - 1] = Number(nextPrice.toFixed(2));
  return out;
}

export function useLiveInstruments(seed: Instrument[], refreshMs = 45000) {
  const [quotesBySymbol, setQuotesBySymbol] = useState<Record<string, LiveQuote>>(
    {}
  );

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/markets/metals", { cache: "no-store" });
      if (!res.ok) return;
      const data: LiveResponse = await res.json();
      if (!data.quotes?.length) return;

      const nextMap = data.quotes.reduce<Record<string, LiveQuote>>((acc, q) => {
        acc[q.symbol] = q;
        return acc;
      }, {});

      setQuotesBySymbol(nextMap);
    } catch {
      // Keep UI stable on network errors by retaining seeded values.
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const id = window.setInterval(fetchQuotes, refreshMs);
    return () => window.clearInterval(id);
  }, [fetchQuotes, refreshMs]);

  const instruments = useMemo(
    () =>
      seed.map((inst) => {
        const live = quotesBySymbol[inst.symbol];
        if (!live) return inst;
        return {
          ...inst,
          price: live.price,
          change: Number(live.change.toFixed(2)),
          changePercent: Number(live.changePercent.toFixed(2)),
          high24h: live.high24h,
          low24h: live.low24h,
          sparklineData: blendSparkline(inst.sparklineData, live.price),
        };
      }),
    [quotesBySymbol, seed]
  );

  return instruments;
}
