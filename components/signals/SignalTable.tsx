"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatPips, cn } from "@/lib/utils";
import type { Signal } from "@/lib/mockData";

interface SignalTableProps {
  signals: Signal[];
}

type StatusFilter = "all" | "won" | "lost" | "active";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "active", label: "Active" },
];

function TpCell({
  price,
  hit,
  status,
}: {
  price: number;
  hit: boolean;
  status: Signal["status"];
}) {
  let icon = "";
  if (status === "active") {
    icon = hit ? " \u2705" : " \u23F3";
  } else if (status === "won") {
    icon = hit ? " \u2705" : "";
  } else {
    icon = hit ? " \u2705" : " \u274C";
  }

  return (
    <td className="font-mono text-sm text-text-secondary py-3 pr-4 text-right whitespace-nowrap">
      {price.toFixed(price < 100 ? 2 : 1)}
      {icon}
    </td>
  );
}

export default function SignalTable({ signals }: SignalTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? signals
        : signals.filter((s) => s.status === statusFilter),
    [signals, statusFilter]
  );

  return (
    <GlassCard hover={false} className="overflow-hidden">
      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "font-body text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 border",
              statusFilter === f.key
                ? "bg-gradient-to-r from-[#3680FF] via-[#F5D060] to-[#3680FF] text-[#06060B] border-transparent shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                : "glass-card-static border-white/10 text-text-secondary hover:text-white hover:border-white/20"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10">
              {[
                "Date",
                "Pair",
                "Direction",
                "Entry",
                "Stop Loss",
                "TP1",
                "TP2",
                "TP3",
                "Status",
                "Pips",
              ].map((header) => (
                <th
                  key={header}
                  className={cn(
                    "font-body text-xs text-text-secondary uppercase tracking-wider pb-3 pr-4",
                    [
                      "Entry",
                      "Stop Loss",
                      "TP1",
                      "TP2",
                      "TP3",
                      "Pips",
                    ].includes(header)
                      ? "text-right"
                      : "text-left"
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((signal, index) => (
              <tr
                key={signal.id}
                className={index % 2 === 1 ? "bg-bg-tertiary/50" : ""}
              >
                <td className="font-mono text-sm text-text-secondary py-3 pr-4 whitespace-nowrap">
                  {signal.date}
                </td>
                <td className="font-mono text-sm text-white font-semibold py-3 pr-4">
                  {signal.pair}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "font-body text-xs font-bold px-2.5 py-1 rounded-full uppercase",
                      signal.direction === "BUY"
                        ? "text-green-profit bg-green-profit/15"
                        : "text-red-loss bg-red-loss/15"
                    )}
                  >
                    {signal.direction}
                  </span>
                </td>
                <td className="font-mono text-sm text-white py-3 pr-4 text-right">
                  {signal.entry.toFixed(signal.entry < 100 ? 2 : 1)}
                </td>
                <td className="font-mono text-sm text-red-loss py-3 pr-4 text-right">
                  {signal.stopLoss.toFixed(signal.stopLoss < 100 ? 2 : 1)}
                </td>
                <TpCell
                  price={signal.tp1}
                  hit={signal.tp1Hit}
                  status={signal.status}
                />
                <TpCell
                  price={signal.tp2}
                  hit={signal.tp2Hit}
                  status={signal.status}
                />
                <TpCell
                  price={signal.tp3}
                  hit={signal.tp3Hit}
                  status={signal.status}
                />
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "font-body text-xs font-bold px-2.5 py-1 rounded-full capitalize",
                      signal.status === "won" &&
                        "text-green-profit bg-green-profit/15",
                      signal.status === "lost" &&
                        "text-red-loss bg-red-loss/15",
                      signal.status === "active" &&
                        "text-[#3680FF] bg-[#3680FF]/15"
                    )}
                  >
                    {signal.status}
                  </span>
                </td>
                <td
                  className={cn(
                    "font-mono text-sm font-semibold py-3 text-right",
                    signal.pips >= 0 ? "text-green-profit" : "text-red-loss"
                  )}
                >
                  {formatPips(signal.pips)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary font-body py-12">
          No signals match the current filter.
        </p>
      )}
    </GlassCard>
  );
}
