"use client";

import { useEffect, useRef } from "react";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface Candle {
  baseX: number;
  baseY: number;
  w: number;
  h: number;
  wickU: number;
  wickD: number;
  bullish: boolean;
  opacity: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  layer: "back" | "mid" | "front";
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  phase: number;
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animId = 0;
    let paused = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let elapsed = 0;
    let lastTime = performance.now();

    function setSize() {
      if (!canvas || !ctx) return;
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setSize();

    // ── Candles ───────────────────────────────────────────────────────
    const GRID = 64;
    const candles: Candle[] = [];
    const counts = {
      back:  Math.floor((W / 90)  * 0.5),
      mid:   Math.floor((W / 130) * 0.45),
      front: Math.floor((W / 170) * 0.35),
    };

    (["back", "mid", "front"] as const).forEach((layer) => {
      const n = counts[layer];
      for (let i = 0; i < n; i++) {
        const wRange  = layer === "back"  ? [4,10]  : layer === "mid" ? [6,14]  : [8,18];
        const hRange  = layer === "back"  ? [12,36] : layer === "mid" ? [18,50] : [24,60];
        const opRange = layer === "back"  ? [0.02,0.045] : layer === "mid" ? [0.03,0.065] : [0.045,0.09];
        const spRange = layer === "back"  ? [0.06,0.14]  : layer === "mid" ? [0.1,0.22]   : [0.14,0.30];
        candles.push({
          baseX:  rand(0, W),
          baseY:  rand(0, H),
          w:      rand(wRange[0], wRange[1]),
          h:      rand(hRange[0], hRange[1]),
          wickU:  rand(4, 20),
          wickD:  rand(4, 20),
          bullish: Math.random() > 0.5,
          opacity: rand(opRange[0], opRange[1]),
          speedX:  rand(spRange[0], spRange[1]) * (Math.random() > 0.5 ? 1 : -1),
          speedY:  rand(0.04, 0.10),
          phaseX:  rand(0, Math.PI * 2),
          phaseY:  rand(0, Math.PI * 2),
          layer,
        });
      }
    });

    // ── Floating gold nodes ──────────────────────────────────────────
    const nodeCount = Math.min(14, Math.floor((W * H) / 100000));
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x:       rand(0, W),
      y:       rand(0, H),
      vx:      rand(-6, 6),
      vy:      rand(-6, 6),
      r:       rand(1, 2.5),
      opacity: rand(0.05, 0.18),
      phase:   rand(0, Math.PI * 2),
    }));

    // ── Price path (animated via layered sines) ──────────────────────
    const PATH_SEGS = 100;

    function priceY(i: number, t: number): number {
      const p = i / (PATH_SEGS - 1);
      return (
        H * 0.38 +
        H * 0.12 * Math.sin(p * Math.PI * 2.2 + t * 0.18) +
        H * 0.06 * Math.sin(p * Math.PI * 5.1 - t * 0.28) +
        H * 0.03 * Math.sin(p * Math.PI * 9.3 + t * 0.42)
      );
    }

    // ── Glow pulse position ──────────────────────────────────────────
    let glowX = W * 0.5;
    let glowY = H * 0.4;
    const glowTargetX = W * rand(0.3, 0.7);
    const glowTargetY = H * rand(0.25, 0.65);

    function frame(now: number) {
      if (paused || !ctx) {
        lastTime = now;
        animId = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, W, H);

      // ── Base gradient background ─────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   "#06091A");
      bg.addColorStop(0.4, "#0A1024");
      bg.addColorStop(1,   "#0F1838");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Subtle gold ambient glow ─────────────────────────────────
      glowX += (glowTargetX - glowX) * 0.0003;
      glowY += (glowTargetY - glowY) * 0.0003;
      const glowPulse = 0.5 + 0.5 * Math.sin(elapsed * 0.25);
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, H * 0.65);
      glow.addColorStop(0,   `rgba(54,128,255,${0.035 * glowPulse})`);
      glow.addColorStop(0.5, `rgba(54,128,255,${0.012 * glowPulse})`);
      glow.addColorStop(1,   "rgba(54,128,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // ── Moving grid ──────────────────────────────────────────────
      const gridOp = 0.025 + 0.01 * Math.sin(elapsed * 0.2);
      ctx.strokeStyle = `rgba(255,255,255,${gridOp})`;
      ctx.lineWidth = 0.5;
      const xOff = (elapsed * 1.2) % GRID;
      const yOff = (elapsed * 0.8) % GRID;
      for (let x = -xOff; x < W + GRID; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x), 0);
        ctx.lineTo(Math.round(x), H);
        ctx.stroke();
      }
      for (let y = -yOff; y < H + GRID; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y));
        ctx.lineTo(W, Math.round(y));
        ctx.stroke();
      }

      // ── Candles (sinusoidal float) ───────────────────────────────
      candles.forEach((c) => {
        const x = c.baseX + Math.sin(elapsed * c.speedX + c.phaseX) * (W * 0.12);
        const y = c.baseY + Math.sin(elapsed * c.speedY + c.phaseY) * (H * 0.06);

        const color = c.bullish ? "rgba(0,200,83," : "rgba(229,57,53,";
        // Back layer fades with a slow breath
        const breathe = c.layer === "back"
          ? 0.6 + 0.4 * Math.sin(elapsed * 0.4 + c.phaseX)
          : 1;
        const alpha = c.opacity * breathe;

        ctx.fillStyle   = color + alpha + ")";
        ctx.strokeStyle = color + alpha + ")";
        ctx.lineWidth = 0.8;

        const wickX = Math.round(x + c.w / 2);
        const cy2   = Math.round(y);
        ctx.beginPath();
        ctx.moveTo(wickX, cy2 - c.wickU);
        ctx.lineTo(wickX, cy2 + c.h + c.wickD);
        ctx.stroke();
        ctx.fillRect(Math.round(x), cy2, Math.round(c.w), Math.round(c.h));
      });

      // ── Animated price path ──────────────────────────────────────
      const pathAlpha = 0.06 + 0.03 * Math.sin(elapsed * 0.35);
      ctx.strokeStyle = `rgba(54,128,255,${pathAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(54,128,255,0.25)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < PATH_SEGS; i++) {
        const px = (i / (PATH_SEGS - 1)) * W;
        const py = priceY(i, elapsed);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Floating gold nodes ──────────────────────────────────────
      nodes.forEach((n) => {
        // Gentle drift with soft boundary wrap
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -10) n.x = W + 10;
        if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10;
        if (n.y > H + 10) n.y = -10;

        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 0.6 + n.phase);
        const gRadius = n.r * (2 + pulse * 2);
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gRadius);
        ng.addColorStop(0,   `rgba(54,128,255,${n.opacity * pulse})`);
        ng.addColorStop(1,   "rgba(54,128,255,0)");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(n.x, n.y, gRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Vignette ─────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.95);
      vig.addColorStop(0,   "rgba(10,10,13,0)");
      vig.addColorStop(0.55,"rgba(10,10,13,0.35)");
      vig.addColorStop(1,   "rgba(10,10,13,0.88)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    function onVisibility() {
      paused = document.hidden;
      if (!paused) lastTime = performance.now();
    }
    document.addEventListener("visibilitychange", onVisibility);

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setSize, 200);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
