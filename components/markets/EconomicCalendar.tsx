"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar } from "lucide-react";

interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  impact: "high" | "medium" | "low";
  previous: string;
  forecast: string;
}

const economicEvents: EconomicEvent[] = [
  {
    date: "Jan 10",
    time: "13:30",
    event: "US Non-Farm Payrolls",
    impact: "high",
    previous: "227K",
    forecast: "164K",
  },
  {
    date: "Jan 29",
    time: "19:00",
    event: "FOMC Interest Rate Decision",
    impact: "high",
    previous: "4.50%",
    forecast: "4.50%",
  },
  {
    date: "Jan 15",
    time: "07:00",
    event: "UK GDP (MoM)",
    impact: "medium",
    previous: "-0.1%",
    forecast: "0.2%",
  },
  {
    date: "Jan 17",
    time: "10:00",
    event: "EU CPI (YoY)",
    impact: "high",
    previous: "2.2%",
    forecast: "2.4%",
  },
  {
    date: "Jan 15",
    time: "13:30",
    event: "US CPI (YoY)",
    impact: "high",
    previous: "2.7%",
    forecast: "2.9%",
  },
  {
    date: "Feb 06",
    time: "12:00",
    event: "BOE Interest Rate Decision",
    impact: "high",
    previous: "4.75%",
    forecast: "4.50%",
  },
  {
    date: "Jan 16",
    time: "13:30",
    event: "US Retail Sales (MoM)",
    impact: "medium",
    previous: "0.7%",
    forecast: "0.5%",
  },
  {
    date: "Jan 28",
    time: "14:30",
    event: "Gold Futures Expiry",
    impact: "low",
    previous: "—",
    forecast: "—",
  },
];

const impactColors: Record<EconomicEvent["impact"], string> = {
  high: "bg-red-loss",
  medium: "bg-amber-500",
  low: "bg-green-profit",
};

export default function EconomicCalendar() {
  return (
    <GlassCard hover={false} className="overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-[#3680FF]" />
        <h3 className="font-heading text-2xl font-semibold text-white">
          Economic Calendar
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="font-body text-xs text-text-secondary uppercase tracking-wider text-left pb-3 pr-4">
                Date / Time
              </th>
              <th className="font-body text-xs text-text-secondary uppercase tracking-wider text-left pb-3 pr-4">
                Event
              </th>
              <th className="font-body text-xs text-text-secondary uppercase tracking-wider text-center pb-3 pr-4">
                Impact
              </th>
              <th className="font-body text-xs text-text-secondary uppercase tracking-wider text-right pb-3 pr-4">
                Previous
              </th>
              <th className="font-body text-xs text-text-secondary uppercase tracking-wider text-right pb-3">
                Forecast
              </th>
            </tr>
          </thead>
          <tbody>
            {economicEvents.map((evt, index) => (
              <tr
                key={`${evt.event}-${index}`}
                className={index % 2 === 1 ? "bg-bg-tertiary/50" : ""}
              >
                <td className="font-data text-sm text-text-secondary py-3 pr-4">
                  {evt.date}{" "}
                  <span className="text-white/40">{evt.time}</span>
                </td>
                <td className="font-body text-sm text-white py-3 pr-4">
                  {evt.event}
                </td>
                <td className="py-3 pr-4 text-center">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${impactColors[evt.impact]}`}
                  />
                </td>
                <td className="font-data text-sm text-text-secondary py-3 pr-4 text-right">
                  {evt.previous}
                </td>
                <td className="font-data text-sm text-white py-3 text-right">
                  {evt.forecast}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
