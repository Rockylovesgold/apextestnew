"use client";

/* ─────────────────────────────────────────────────
   MEMBER LOGO STRIP
   Continuous CSS marquee of partner / platform logos.
   Two identical rows run at slightly different speeds
   for depth. Pure CSS animation — no JS.
───────────────────────────────────────────────── */

const partners = [
  { name: "MetaTrader 5",   abbr: "MT5"       },
  { name: "TradingView",    abbr: "TV"        },
  { name: "IC Markets",     abbr: "ICM"       },
  { name: "Pepperstone",    abbr: "PPTR"      },
  { name: "XM Trading",     abbr: "XM"        },
  { name: "IG Group",       abbr: "IG"        },
  { name: "FXCM",           abbr: "FXCM"      },
  { name: "Plus500",        abbr: "P500"      },
  { name: "OANDA",          abbr: "OANDA"     },
  { name: "Saxo Bank",      abbr: "SAXO"      },
];

// Duplicate for seamless loop
const track = [...partners, ...partners];

function LogoPill({ name, abbr }: { name: string; abbr: string }) {
  return (
    <div
      aria-label={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 24px",
        height: "48px",
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        flexShrink: 0,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "var(--color-accent-gold)",
          letterSpacing: "0.12em",
          opacity: 0.7,
        }}
      >
        {abbr}
      </span>
      <span
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export function MemberLogoStrip() {
  return (
    <section
      style={{
        background: "var(--color-bg-base)",
        borderTop: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
        padding: "32px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left + right edge fades */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, var(--color-bg-base) 0%, transparent 10%, transparent 90%, var(--color-bg-base) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Eyebrow label */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <span
          className="label-eyebrow"
          style={{ opacity: 0.6 }}
        >
          Compatible with leading platforms & brokers
        </span>
      </div>

      {/* Scrolling track */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            animation: "marquee 30s linear infinite",
            width: "max-content",
          }}
        >
          {track.map((p, i) => (
            <LogoPill key={`${p.abbr}-${i}`} name={p.name} abbr={p.abbr} />
          ))}
        </div>
      </div>
    </section>
  );
}
