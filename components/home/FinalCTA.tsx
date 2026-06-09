"use client";

import { Twitter, Facebook, Instagram, Send } from "lucide-react";
import { GoldButton } from "@/components/ui/GoldButton";

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/apexgoldtrading?igsh=MWd6NGh3bXh2YTRsMQ%3D%3D&utm_source=qr", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@apexgoldtrading?_r=1&_t=ZN-954UJPWkRlO", label: "TikTok" },
  { icon: Facebook, href: "https://www.facebook.com/share/1L46q81nFJ/?mibextid=wwXIfr", label: "Facebook" },
  { icon: Send, href: "https://t.me/charist12", label: "Telegram" },
  { icon: Twitter, href: "https://x.com/shabbaranks333?s=21", label: "Twitter / X" },
];

export function FinalCTA() {
  return (
    <section
      id="join"
      className="cta-banner reveal"
    >
      <div className="container-max" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <span className="label-eyebrow" style={{ display: "block", marginBottom: "16px" }}>
            Step inside the desk
          </span>
          <h2 style={{ marginBottom: "16px" }}>Trade gold and bitcoin with structure</h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              maxWidth: "480px",
              margin: "0 auto 40px",
              lineHeight: "var(--leading-relaxed)",
            }}
          >
            Join the AIOV Capital community. XAU/USD and BTC/USD analysis, trade ideas, and education — delivered daily in one high-trust environment.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", justifyContent: "center" }}>
            <GoldButton variant="primary" size="lg" href="https://t.me/charist12" showArrow>
              Join the Community
            </GoldButton>
            <GoldButton variant="secondary" size="lg" href="/about">
              Learn more
            </GoldButton>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "32px" }}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  height: "38px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(54,128,255,0.4)",
                  color: "rgba(54,128,255,0.85)",
                  fontSize: "13px",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  background: "rgba(54,128,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.7)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-accent-gold)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.12)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.4)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(54,128,255,0.85)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                }}
              >
                <s.icon size={14} />
                {s.label}
              </a>
            ))}
          </div>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              marginTop: "20px",
            }}
          >
            No lock-in. Risk disclaimer applies. See{" "}
            <a
              href="/legal"
              style={{ color: "var(--color-accent-gold)", textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
            >
              Legal &amp; Risk
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
