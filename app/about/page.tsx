"use client";

import Image from "next/image";
import { Eye, Users, GraduationCap, Twitter, Facebook, Instagram, Send } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamSection } from "@/components/home/TeamSection";
import { timelineEvents } from "@/lib/mockData";

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const stats = [
  { value: "20+", label: "Years Trading Experience" },
  { value: "86%", label: "Reported Win Rate" },
  { value: "20+", label: "Years Experience Between Traders" },
  { value: "8–10", label: "Daily Signals" },
  { value: "5,000+", label: "Community Members" },
  { value: "UK & Dubai", label: "Operating Locations" },
];

const values = [
  {
    title: "Transparency",
    icon: Eye,
    description:
      "Every trade is logged and verifiable. We never hide losses or cherry-pick results. Our track record is open for all to see.",
  },
  {
    title: "Community",
    icon: Users,
    description:
      "More than just signals — we're a community of traders, affiliates, and entrepreneurs supporting each other. Share strategies, discuss markets, and grow together.",
  },
  {
    title: "Education",
    icon: GraduationCap,
    description:
      "We believe in teaching you to fish. Our educational resources help you understand why trades work, not just what to trade.",
  },
];

const socials = [
  { label: "Twitter / X", handle: "@apexgoldtrading", icon: Twitter, href: "https://x.com/shabbaranks333?s=21" },
  { label: "Instagram", handle: "@apexgoldtrading", icon: Instagram, href: "https://www.instagram.com/apexgoldtrading?igsh=MWd6NGh3bXh2YTRsMQ%3D%3D&utm_source=qr" },
  { label: "TikTok", handle: "@apexgoldtrading", icon: TikTokIcon, href: "https://www.tiktok.com/@apexgoldtrading?_r=1&_t=ZN-954UJPWkRlO" },
  { label: "Facebook", handle: "AIOV Capital", icon: Facebook, href: "https://www.facebook.com/share/1L46q81nFJ/?mibextid=wwXIfr" },
  { label: "Telegram", handle: "Live Community", icon: Send, href: "https://t.me/charist12" },
  { label: "Results Channel", handle: "Trade Results", icon: Send, href: "https://t.me/charist12" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
        <div className="container-max">
          <SectionHeading
            eyebrow="About"
            title="The Story Behind AIOV Capital"
            subtitle="Founded by traders who've been in the markets since 2016 — operating between Dubai and the UK to serve traders worldwide with real-time gold signals and professional education"
          />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="section-padding" style={{ paddingTop: 0, paddingBottom: "2rem" }}>
        <div className="container-max">
          <div
            className="reveal-group"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="card reveal"
                style={{ textAlign: "center", padding: "24px 16px" }}
              >
                <p
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    fontWeight: 700,
                    color: "var(--color-accent-gold)",
                    marginBottom: "6px",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="section-padding" style={{ paddingTop: "2rem" }}>
        <div className="container-max">
          <div
            className="card reveal"
            style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center" }}
          >
            <div style={{ width: "clamp(120px, 35vw, 180px)", height: "clamp(120px, 35vw, 180px)", flexShrink: 0, position: "relative" }}>
              <Image
                src="/team/shabbaranks_2.png"
                alt="Anthony — Founder"
                fill
                style={{ objectFit: "contain" }}
                sizes="180px"
              />
            </div>

            <div style={{ flex: 1, minWidth: "240px" }}>
              <h3 style={{ fontSize: "var(--text-3xl)", marginBottom: "4px" }}>Anthony</h3>
              <p
                style={{
                  color: "var(--color-accent-gold)",
                  fontSize: "var(--text-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "24px",
                }}
              >
                Founder &amp; Lead Trader
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                  Anthony is the founder and lead analyst of AIOV Capital. With over eight years of experience across cryptocurrency and gold (XAU/USD) markets, he has developed a deep, systematic understanding of price action, market structure, and risk-managed trade execution — beginning in crypto in 2016, expanding into forex in 2020, and identifying gold as the most consistent and tradeable market from 2022 onwards.
                </p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                  Operating between the UK and Dubai, Anthony built the AIOV Capital community from the ground up — starting as a private Telegram group and growing it into a global operation of 5,000+ members. He personally oversees the daily signal desk, delivering 8–10 structured trade ideas every day with a reported 86% win rate.
                </p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                  His mission is straightforward: remove the barriers to financial markets and give everyday people access to the same opportunities as professionals — using nothing more than a phone or laptop, from anywhere in the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="section-padding reveal">
        <div className="container-max">
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto", textAlign: "center", padding: "0 clamp(16px, 4vw, 32px)" }}>
            <span style={{ position: "absolute", top: "-16px", left: "-8px", color: "rgba(54,128,255,0.15)", fontSize: "80px", lineHeight: 1, userSelect: "none", pointerEvents: "none", fontFamily: "Georgia, serif" }}>
              &ldquo;
            </span>
            <p style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: "var(--color-accent-gold)", fontStyle: "italic", lineHeight: "var(--leading-snug)", margin: 0 }}>
              The mission is simple: to help you create true financial freedom using just your phone or laptop, from anywhere in the world.
            </p>
            <span style={{ position: "absolute", bottom: "-40px", right: "-8px", color: "rgba(54,128,255,0.15)", fontSize: "80px", lineHeight: 1, userSelect: "none", pointerEvents: "none", fontFamily: "Georgia, serif" }}>
              &rdquo;
            </span>
          </div>
        </div>
      </section>

      {/* Team */}
      <TeamSection />

      {/* Timeline */}
      <section className="section-padding">
        <div className="container-max">
          <SectionHeading eyebrow="History" title="Our Journey" />
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "1px", background: "rgba(54,128,255,0.2)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
              {timelineEvents.map((event) => (
                <div key={event.date} className="reveal" style={{ position: "relative", paddingLeft: "48px" }}>
                  <div style={{ position: "absolute", left: "8px", top: "4px", width: "16px", height: "16px", borderRadius: "50%", background: "var(--color-accent-gold)", zIndex: 1 }} />
                  <div className="card" style={{ maxWidth: "480px" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--color-accent-gold)", marginBottom: "4px" }}>{event.date}</p>
                    <h4 style={{ marginBottom: "8px" }}>{event.title}</h4>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
        <div className="container-max">
          <SectionHeading eyebrow="Philosophy" title="Our Values" />
          <div className="reveal-group feature-grid">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="card reveal" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="card-icon">
                    <Icon size={20} strokeWidth={1.5} style={{ color: "var(--color-accent-gold)" }} />
                  </div>
                  <h3 style={{ marginBottom: "10px" }}>{value.title}</h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", margin: 0, flex: 1 }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="section-padding">
        <div className="container-max">
          <SectionHeading
            eyebrow="Follow Us"
            title="Stay Connected"
            subtitle="Live signals, trade updates, and community highlights across all our channels"
          />
          <div
            className="reveal-group"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
              gap: "16px",
            }}
          >
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card reveal"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "20px",
                    textDecoration: "none",
                    border: "1px solid rgba(54,128,255,0.35)",
                    background: "rgba(54,128,255,0.04)",
                    transition: "border-color 0.15s ease, background 0.15s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.65)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.1)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.35)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.04)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: "1px solid rgba(54,128,255,0.5)",
                      background: "rgba(54,128,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-accent-gold)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500, margin: 0 }}>
                      {s.handle}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
