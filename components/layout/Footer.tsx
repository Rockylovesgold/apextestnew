"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Twitter,
  Send,
  Facebook,
  Instagram,
  ArrowRight,
  MapPin,
  MessageCircle,
} from "lucide-react";

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Community", href: "/community" },
  { label: "Team", href: "/team" },
  { label: "Trade Ideas", href: "/signals" },
  { label: "Education", href: "/education" },
  { label: "About", href: "/about" },
];

const resourceLinks = [
  { label: "Legal & Risk Disclosure", href: "/legal" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { icon: Twitter, href: "https://x.com/shabbaranks333?s=21", label: "Twitter / X" },
  { icon: Instagram, href: "https://www.instagram.com/apexgoldtrading?igsh=MWd6NGh3bXh2YTRsMQ%3D%3D&utm_source=qr", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@apexgoldtrading?_r=1&_t=ZN-954UJPWkRlO", label: "TikTok" },
  { icon: Facebook, href: "https://www.facebook.com/share/1L46q81nFJ/?mibextid=wwXIfr", label: "Facebook" },
  { icon: Send, href: "https://t.me/charist12", label: "Telegram" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-bg-secondary border-t border-white/10">
      <div
        aria-hidden
        className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(54,128,255,0.05)_0%,transparent_65%)] pointer-events-none"
      />

      <div className="container-max relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex">
              <Image src="/aiov-capital-logo.png" alt="AIOV Capital" width={120} height={120} className="h-16 w-auto" />
            </Link>
            <p className="text-sm text-text-tertiary max-w-xs">
              A premium gold-focused trading community built on discipline, structure, and execution.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 hover:bg-gold/10 hover:scale-105 transition-all duration-fast text-xs font-medium"
                >
                  <social.icon size={14} />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="label-eyebrow mb-3">Platform</p>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex items-center gap-1.5 py-1 text-sm text-text-secondary hover:text-text-primary hover:translate-x-0.5 transition-all duration-fast">
                    <ArrowRight size={11} className="opacity-40" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-eyebrow mb-3">Legal &amp; Info</p>
            <ul className="space-y-1">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex items-center gap-1.5 py-1 text-sm text-text-secondary hover:text-text-primary hover:translate-x-0.5 transition-all duration-fast">
                    <ArrowRight size={11} className="opacity-40" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 text-xs text-text-tertiary">
              <a href="https://t.me/charist12" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-text-primary transition-colors duration-fast">
                <MessageCircle size={12} />
                Telegram Support Bot
              </a>
              <a href="https://t.me/charist12" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-text-primary transition-colors duration-fast">
                <Send size={12} />
                Live Results Channel
              </a>
              <p className="inline-flex items-center gap-2">
                <MapPin size={12} />
                Dubai &amp; United Kingdom
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-max py-4 flex flex-col lg:flex-row gap-3 lg:justify-between">
          <p className="text-xs text-text-tertiary max-w-3xl">
            Trading gold and forex carries significant risk of loss. 71–80% of retail investor accounts lose money when trading CFDs. Past performance is not indicative of future results. All content is provided for educational and informational purposes only and does not constitute financial advice.
          </p>
          <p className="text-xs text-text-tertiary whitespace-nowrap">&copy; 2026 AIOV Capital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
