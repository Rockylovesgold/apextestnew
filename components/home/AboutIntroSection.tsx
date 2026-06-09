"use client";

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutIntroSection() {
  return (
    <section
      id="about"
      className="section-padding"
      style={{ background: "var(--color-bg-surface)" }}
    >
      <div className="container-max">
        <SectionHeading
          eyebrow="About us"
          title="About AIOV Capital"
          subtitle="A premier trading brand built on 20+ years of professional experience in cryptocurrency and gold (XAU/USD) markets — operating between Dubai and the UK"
          align="left"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
            alignItems: "center",
          }}
          className="md:grid-cols-2"
        >
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-relaxed)",
                margin: 0,
              }}
            >
              AIOV Capital is a high-performance trading community supported by a private Telegram group with a reported 86% success rate on shared trade ideas and signals. Members gain access to real-time market analysis, clear trade setups, and an active community focused on disciplined, professional trading.
            </p>
            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-relaxed)",
                margin: 0,
              }}
            >
              The mission is simple: to help you create true financial freedom using just your phone or laptop, from anywhere in the world. Whether you&apos;re just starting out or looking to sharpen your edge, AIOV Capital gives you the signals, education, and community to trade gold with confidence.
            </p>
          </div>
          <div
            className="reveal card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "240px",
              position: "relative",
              overflow: "hidden",
              background: "rgba(10,11,13,0.8)",
              padding: 0,
            }}
          >
            <Image
              src="/brand/aiov-evolution-transition.jpg"
              alt="AIOV Capital — evolved from Apex Gold Trading"
              fill
              style={{ objectFit: "contain", padding: "24px" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
