"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Signals", href: "/signals" },
  { label: "Community", href: "/community" },
  { label: "Team", href: "/team" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 48);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="nav-load fixed inset-x-0 top-0 z-[1000] flex h-[68px] items-center transition-all duration-[350ms] ease-out"
        style={{
          background: scrolled
            ? "rgba(10,11,13,0.96)"
            : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(54,128,255,0.18)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 1px 0 rgba(54,128,255,0.06), 0 8px 40px rgba(0,0,0,0.5)"
            : "none",
        }}
      >
        {/* Gold shimmer line at very top when scrolled */}
        {scrolled && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, rgba(54,128,255,0.4) 25%, rgba(122,179,255,0.7) 50%, rgba(54,128,255,0.4) 75%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        )}

        <div className="container-max w-full">
          <div className="flex h-[68px] items-center justify-between gap-6">

            {/* Logo */}
            <Link href="/" className="group no-underline flex-shrink-0">
              <Image
                src="/aiov-capital-logo.png"
                alt="AIOV Capital"
                width={120}
                height={120}
                priority
                className="h-[52px] w-auto shrink-0 transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_12px_rgba(54,128,255,0.4)]"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="no-underline"
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "0.8125rem",
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: "0.01em",
                      color: isActive ? "#3680FF" : "rgba(168,162,158,0.9)",
                      background: isActive ? "rgba(54,128,255,0.08)" : "transparent",
                      border: isActive ? "1px solid rgba(54,128,255,0.16)" : "1px solid transparent",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#F0EDE8";
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.color = "rgba(168,162,158,0.9)";
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <NavLoginButton href="https://apextradingxau.com" label="Login" />
              <NavCTAButton href="https://t.me/charist12" label="Join Now" />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                border: "1px solid rgba(54,128,255,0.2)",
                background: "rgba(54,128,255,0.04)",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
              className="lg:hidden"
            >
              <span
                style={{
                  display: "block",
                  height: "1.5px",
                  width: "18px",
                  background: "#3680FF",
                  borderRadius: "2px",
                  transition: "all 0.25s ease",
                  transform: mobileOpen ? "translateY(6.5px) rotate(45deg)" : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  height: "1.5px",
                  width: "18px",
                  background: "#F0EDE8",
                  borderRadius: "2px",
                  transition: "all 0.2s ease",
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  height: "1.5px",
                  width: "18px",
                  background: "#3680FF",
                  borderRadius: "2px",
                  transition: "all 0.25s ease",
                  transform: mobileOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          background: "rgba(10,11,13,0.98)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          transform: mobileOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: mobileOpen ? "auto" : "none",
          overflowY: "auto",
        }}
      >
        {/* Gold line at top */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(54,128,255,0.6), rgba(122,179,255,0.9), rgba(54,128,255,0.6), transparent)", flexShrink: 0 }} />

        {/* Logo in mobile menu */}
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Image src="/aiov-capital-logo.png" alt="AIOV Capital" width={80} height={80} className="h-[60px] w-auto" />
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "8px 24px" }}>
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="no-underline"
                style={{
                  display: "block",
                  padding: "16px 20px",
                  fontSize: "1.375rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#3680FF" : "rgba(240,237,232,0.85)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  letterSpacing: "-0.01em",
                  transition: "all 0.25s ease",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateX(0)" : "translateX(-16px)",
                  transitionDelay: mobileOpen ? `${80 + index * 45}ms` : "0ms",
                  background: isActive ? "rgba(54,128,255,0.06)" : "transparent",
                  borderRadius: isActive ? "10px" : "0",
                  marginBottom: isActive ? "2px" : "0",
                }}
              >
                {isActive && (
                  <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", background: "#3680FF", marginRight: "10px", verticalAlign: "middle", marginBottom: "2px" }} />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile CTA */}
        <div
          style={{
            padding: "24px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.3s ease",
            transitionDelay: mobileOpen ? `${80 + navItems.length * 45}ms` : "0ms",
          }}
        >
          <a
            href="https://t.me/charist12"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "52px",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #7AB3FF 0%, #3680FF 60%, #1E50B3 100%)",
              color: "#070C1C",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.01em",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(54,128,255,0.35)",
            }}
          >
            Join the Community
          </a>
          <a
            href="https://apextradingxau.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "48px",
              borderRadius: "9999px",
              background: "transparent",
              border: "1px solid rgba(54,128,255,0.3)",
              color: "rgba(240,237,232,0.85)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            App Login
          </a>
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(168,162,158,0.5)", marginTop: "2px", letterSpacing: "0.04em" }}>
            Free to join · Signals sent daily
          </p>
        </div>

        {/* Gold line at bottom */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(54,128,255,0.4), transparent)", flexShrink: 0 }} />
      </div>
    </>
  );
}

function NavLoginButton({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "38px",
        padding: "0 18px",
        borderRadius: "9999px",
        background: "transparent",
        border: "1px solid rgba(54,128,255,0.3)",
        color: "rgba(240,237,232,0.8)",
        fontWeight: 600,
        fontSize: "0.8125rem",
        letterSpacing: "0.01em",
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.6)";
        (e.currentTarget as HTMLAnchorElement).style.color = "#3680FF";
        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.3)";
        (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,237,232,0.8)";
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
      }}
    >
      {label}
    </Link>
  );
}

function NavCTAButton({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "38px",
        padding: "0 20px",
        borderRadius: "9999px",
        background: "linear-gradient(135deg, #7AB3FF 0%, #3680FF 60%, #1E50B3 100%)",
        color: "#070C1C",
        fontWeight: 700,
        fontSize: "0.8125rem",
        letterSpacing: "0.01em",
        textDecoration: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 12px rgba(54,128,255,0.25)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(54,128,255,0.4)";
        (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 12px rgba(54,128,255,0.25)";
        (e.currentTarget as HTMLAnchorElement).style.filter = "";
      }}
    >
      {label}
    </Link>
  );
}
