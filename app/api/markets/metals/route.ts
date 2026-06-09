import { NextResponse } from "next/server";

type SymbolKey = "XAU/USD" | "XAG/USD";

interface LiveQuote {
  symbol: SymbolKey;
  price: number;
  open: number;
  high24h: number;
  low24h: number;
  change: number;
  changePercent: number;
  asOf: string;
}

interface CsvRow {
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const SOURCES: Record<SymbolKey, string> = {
  "XAU/USD": "https://stooq.com/q/l/?s=xauusd&f=sd2t2ohlcv&h&e=csv",
  "XAG/USD": "https://stooq.com/q/l/?s=xagusd&f=sd2t2ohlcv&h&e=csv",
};

function parseCsvQuote(csv: string): CsvRow | null {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return null;
  const row = lines[1].split(",");
  if (row.length < 7) return null;

  const open = Number.parseFloat(row[3]);
  const high = Number.parseFloat(row[4]);
  const low = Number.parseFloat(row[5]);
  const close = Number.parseFloat(row[6]);

  if ([open, high, low, close].some((n) => Number.isNaN(n))) return null;

  return {
    date: row[1],
    time: row[2],
    open,
    high,
    low,
    close,
  };
}

async function fetchSymbolQuote(symbol: SymbolKey): Promise<LiveQuote | null> {
  const res = await fetch(SOURCES[symbol], {
    cache: "no-store",
    headers: {
      "User-Agent": "aiovcapital/1.0",
      Accept: "text/csv,*/*",
    },
  });

  if (!res.ok) return null;
  const text = await res.text();
  const parsed = parseCsvQuote(text);
  if (!parsed) return null;

  const change = parsed.close - parsed.open;
  const changePercent = parsed.open === 0 ? 0 : (change / parsed.open) * 100;

  return {
    symbol,
    price: parsed.close,
    open: parsed.open,
    high24h: parsed.high,
    low24h: parsed.low,
    change,
    changePercent,
    asOf: `${parsed.date}T${parsed.time}Z`,
  };
}

export async function GET() {
  try {
    const [gold, silver] = await Promise.all([
      fetchSymbolQuote("XAU/USD"),
      fetchSymbolQuote("XAG/USD"),
    ]);

    const quotes = [gold, silver].filter(Boolean);
    if (quotes.length === 0) {
      return NextResponse.json(
        { error: "Unable to fetch metals quotes" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { quotes, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch live metals prices" },
      { status: 500 }
    );
  }
}
