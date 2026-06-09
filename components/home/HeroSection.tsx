"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { GoldButton } from "@/components/ui/GoldButton";

/* ────────────────────────────────────────────────
   CANDLESTICK BACKGROUND CANVAS
   Scrolls a live-looking OHLC candlestick chart
   from right → left at a slow, ambient speed.
──────────────────────────────────────────────── */
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // All mutable state lives in a ref so we never re-run the effect
  const stateRef = useRef({
    scrollOffset: 0,
    priceLevel: 0.50,
    // buffer: each entry = [open, close, high, low] normalised 0-1
    buffer: [] as [number, number, number, number][],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    /* ── Layout constants ── */
    const CW = 11;          // candle body width  (logical px)
    const GAP = 5;          // gap between candles
    const STEP = CW + GAP;  // total horizontal step
    const SPEED = 0.28;     // px per frame  (lower = slower)
    const CHART_TOP = 0.10; // fraction of canvas height  (top margin)
    const CHART_BOT = 0.82; // fraction (bottom of price area)

    /* ── Canvas sizing ── */
    function resize() {
      if (!canvas || !ctx) return;
      canvas.width  = canvas.offsetWidth  * DPR;
      canvas.height = canvas.offsetHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ── Price walk generator ── */
    function genCandle(): [number, number, number, number] {
      const prev = state.priceLevel;
      // Slight bullish drift (gold markets tend to trend)
      const change = (Math.random() - 0.47) * 0.065;
      const open  = prev;
      const close = Math.max(0.07, Math.min(0.91, open + change));
      state.priceLevel = close;

      const bodyRange = Math.abs(close - open);
      const wickScale = 0.9 + Math.random() * 1.4;
      const high = Math.max(open, close) + bodyRange * wickScale * (0.4 + Math.random() * 0.6) + 0.006;
      const low  = Math.min(open, close) - bodyRange * wickScale * (0.4 + Math.random() * 0.6) - 0.006;

      return [
        open, close,
        Math.min(high, 0.96),
        Math.max(low,  0.04),
      ];
    }

    /* ── Ensure buffer has at least `need` entries ── */
    function ensureBuffer(need: number) {
      while (state.buffer.length <= need) {
        state.buffer.push(genCandle());
      }
    }

    // Pre-fill with 120 candles
    for (let i = 0; i < 120; i++) state.buffer.push(genCandle());

    /* ── Y-coordinate mapping ── */
    function toY(h: number, price: number): number {
      const top = h * CHART_TOP;
      const bot = h * CHART_BOT;
      return top + (bot - top) * (1 - price); // 1 = top of chart, 0 = bottom
    }

    /* ── Main draw loop ── */
    function draw() {
      if (!canvas || !ctx) return;

      if (document.hidden) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      state.scrollOffset += SPEED;

      // Which candle indices are visible?
      const firstIdx = Math.max(0, Math.floor((state.scrollOffset - CW) / STEP));
      const lastIdx  = Math.ceil((w + state.scrollOffset + STEP) / STEP);
      ensureBuffer(lastIdx + 4);

      /* ── Horizontal grid lines ── */
      ctx.lineWidth = 0.5;
      for (let g = 1; g <= 5; g++) {
        const y = toY(h, g / 6);
        ctx.strokeStyle = `rgba(54, 128, 255, 0.045)`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      /* ── Vertical grid (every 8 candles, faint) ── */
      const gridSpacing = STEP * 8;
      const gridPhase = state.scrollOffset % gridSpacing;
      for (let gx = -gridSpacing; gx <= w + gridSpacing; gx += gridSpacing) {
        const x = gx + gridSpacing - gridPhase;
        ctx.strokeStyle = `rgba(54, 128, 255, 0.028)`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      /* ── Candles ── */
      for (let n = firstIdx; n <= lastIdx; n++) {
        const screenX = n * STEP - state.scrollOffset;

        if (screenX > w + STEP || screenX < -STEP) continue;

        const [open, close, high, low] = state.buffer[n] || [0.5, 0.5, 0.55, 0.45];
        const bull = close >= open;

        const cx    = screenX + CW / 2;
        const bTop  = toY(h, Math.max(open, close));
        const bBot  = toY(h, Math.min(open, close));
        const wTop  = toY(h, high);
        const wBot  = toY(h, low);
        const bH    = Math.max(bBot - bTop, 1.5);

        // Edge fade: candles near edges fade to transparent
        const fadeLeft  = Math.min(1, (screenX + CW) / 80);
        const fadeRight = Math.min(1, (w - screenX)  / 80);
        const alpha = Math.max(0, Math.min(fadeLeft, fadeRight));
        if (alpha <= 0) continue;

        /* ── Wick ── */
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = bull
          ? `rgba(54, 128, 255, ${0.42 * alpha})`
          : `rgba(122, 179, 255, ${0.30 * alpha})`;
        ctx.beginPath();
        ctx.moveTo(cx, wTop);
        ctx.lineTo(cx, wBot);
        ctx.stroke();

        /* ── Body fill ── */
        ctx.fillStyle = bull
          ? `rgba(54, 128, 255, ${0.34 * alpha})`
          : `rgba(30, 80, 179, ${0.22 * alpha})`;
        ctx.fillRect(screenX, bTop, CW, bH);

        /* ── Body border ── */
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = bull
          ? `rgba(122, 179, 255, ${0.55 * alpha})`
          : `rgba(60, 130, 220, ${0.40 * alpha})`;
        ctx.strokeRect(screenX, bTop, CW, bH);
      }

      /* ── Subtle price-level glow strip ── */
      const currentY = toY(h, state.priceLevel);
      const grad = ctx.createLinearGradient(0, currentY - 20, 0, currentY + 20);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, "rgba(54, 128, 255, 0.04)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, currentY - 20, w, 40);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    function onVisibility() {
      if (!document.hidden && !rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
}

/* ────────────────────────────────────────────────
   HERO BRAND VISUAL
──────────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1600 / 916",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid rgba(54,128,255,0.20)",
        background: "linear-gradient(160deg, #0C132A 0%, #070C1C 100%)",
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(54,128,255,0.08) inset",
      }}
    >
      <Image
        src="/brand/aiov-hero-built-for-traders.jpg"
        alt="AIOV Capital — Built for traders. Powered by AIOV Capital. Analysis · Education · Execution"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        style={{ objectFit: "contain" }}
      />

      {/* Subtle blue corner glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(54,128,255,0.18) 0%, transparent 60%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* Top blue accent line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, rgba(54,128,255,0.7) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

const trustChips = [
  "XAU/USD focus",
  "Community driven",
  "Disciplined execution",
  "Education & support",
];

/* ────────────────────────────────────────────────
   HERO SECTION
──────────────────────────────────────────────── */
export function HeroSection() {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indicator = scrollIndicatorRef.current;
    if (!indicator) return;
    function handleScroll() {
      if (!indicator) return;
      indicator.style.opacity = window.scrollY > 200 ? "0" : "1";
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-bg-base pt-[72px]"
    >
      {/* ── Layer 1: Canvas candlesticks ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <HeroCanvas />
      </div>

      {/* ── Layer 2: Radial gold spotlight ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 55% at 50% 42%, rgba(54,128,255,0.07) 0%, transparent 68%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 3: Dot grid ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 4: Vignette edges ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(10,11,13,0.55) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 5: Bottom fade to base ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "28%",
          background:
            "linear-gradient(to bottom, transparent, var(--color-bg-base))",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {/* ── Content ── */}
      <div className="container-max relative z-10 w-full py-12">
        <div
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2"
        >
          {/* Left: Text */}
          <div className="text-center lg:text-left">

            <p className="label-eyebrow hero-eyebrow" style={{ marginBottom: "16px" }}>
              Gold-focused trading community
            </p>

            <h1 className="mb-0">
              <span className="hero-h1-1 block">
                A disciplined trading community
              </span>
              <span className="hero-h1-2 mt-1 block text-gold">
                focused on gold, macro, and execution.
              </span>
            </h1>

            <p
              style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
              className="hero-subhead mt-3 mb-0 max-w-[560px] leading-[1.65] text-text-secondary lg:mx-0"
            >
              Professional market analysis, trade ideas, and trading education
              in one high-trust environment. Structure, discipline, and execution.
            </p>

            <div className="hero-cta mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              <GoldButton variant="primary" size="lg" href="https://t.me/charist12" showArrow>
                Join the Community
              </GoldButton>
              <GoldButton variant="secondary" size="lg" href="/about">
                Explore the Platform
              </GoldButton>
            </div>

            <div
              className="hero-badges mt-5 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              {trustChips.map((chip, i) => (
                <span
                  key={chip}
                  className={`hero-badge-${i + 1}`}
                  style={{
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--color-border-default)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "6px 14px",
                    fontSize: "var(--text-xs)",
                    fontWeight: 500,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Brand visual */}
          <div className="hero-slide-left">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="scroll-indicator"
        style={{ transition: "opacity 0.4s ease", zIndex: 10 }}
      >
        <div className="scroll-indicator-line" />
        <div className="scroll-indicator-dot" />
      </div>
    </section>
  );
}
