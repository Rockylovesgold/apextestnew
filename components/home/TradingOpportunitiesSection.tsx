"use client";

import { Radio, Bell } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const days = [
  { label: "Mon", icon: Radio, desc: "Trade alerts" },
  { label: "Tue", icon: Radio, desc: "Trade alerts" },
  { label: "Wed", icon: Bell, desc: "Active sessions" },
  { label: "Thu", icon: Radio, desc: "Trade alerts" },
  { label: "Fri", icon: Radio, desc: "Trade alerts" },
];

export function TradingOpportunitiesSection() {
  return (
    <section className="section-padding bg-bg-secondary">
      <div className="container-max">
        <SectionHeading
          title="Trade Alerts Every Day"
          subtitle="Monday to Friday—live alerts and active sessions"
        />
        <AnimatedSection>
          <GlassCard hover={false} className="overflow-hidden">
            <div className="relative">
              {/* Gold flow line */}
              <div
                className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent -translate-y-1/2"
                aria-hidden
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
                {days.map((day) => {
                  const Icon = day.icon;
                  return (
                    <div
                      key={day.label}
                      className="flex flex-col items-center text-center p-4 rounded-xl bg-bg-tertiary/50 border border-white/5 hover:border-gold/20 transition-colors duration-300"
                    >
                      <Icon
                        className="w-8 h-8 text-gold mb-2"
                        strokeWidth={1.5}
                      />
                      <span className="font-data text-sm font-semibold text-white">
                        {day.label}
                      </span>
                      <span className="font-body text-xs text-text-secondary mt-0.5">
                        {day.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="font-body text-sm text-text-secondary text-center mt-6">
              Signals and market discussion throughout the trading week
            </p>
          </GlassCard>
        </AnimatedSection>
      </div>
    </section>
  );
}
