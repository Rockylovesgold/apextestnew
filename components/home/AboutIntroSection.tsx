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
              position: "relative",
              width: "100%",
              maxWidth: "440px",
              margin: "0 auto",
              aspectRatio: "1086 / 1600",
              overflow: "hidden",
              background: "linear-gradient(160deg, #0C132A 0%, #070C1C 100%)",
              padding: 0,
              border: "1px solid rgba(54,128,255,0.20)",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(54,128,255,0.08) inset",
            }}
          >
            <Image
              src="/brand/aiov-evolution-transition.jpg"
              alt="AIOV Capital — evolved from Apex Gold Trading"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, 440px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
