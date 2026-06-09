/**
 * Scroll Animation System
 * CSS-class-based scroll reveal + counter animations via IntersectionObserver
 */

let revealObserver: IntersectionObserver | null = null;
let counterObserver: IntersectionObserver | null = null;
let processObserver: IntersectionObserver | null = null;

/**
 * easeOutExpo easing for counter animation
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Format number with commas
 */
function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Animate a single counter element from 0 → target
 */
function animateCounter(el: HTMLElement) {
  const raw = el.getAttribute("data-target");
  if (!raw) return;

  const target = parseFloat(raw);
  if (isNaN(target)) return;

  const suffix = el.getAttribute("data-suffix") || "";
  const prefix = el.getAttribute("data-prefix") || "";
  const duration = 1800;
  const startTime = performance.now();

  function tick(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(t);
    const current = Math.round(eased * target);

    // Use decimal if target isn't integer (e.g. 91.5)
    const display =
      target % 1 !== 0
        ? (eased * target).toFixed(1)
        : formatNumber(current);

    el.textContent = `${prefix}${display}${suffix}`;

    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/**
 * Initialize scroll-reveal: adds `.in-view` to `.reveal` elements on entry.
 * Must be called after DOM is ready (e.g. in useEffect).
 */
export function initScrollReveal() {
  if (typeof window === "undefined") return;

  revealObserver?.disconnect();

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
    revealObserver?.observe(el);
  });
}

/**
 * Initialize counter animations: triggers count-up on `.stat-number[data-target]` entry.
 */
export function initCounterAnimations() {
  if (typeof window === "undefined") return;

  counterObserver?.disconnect();

  counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement);
          counterObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document
    .querySelectorAll<HTMLElement>(".stat-number[data-target]")
    .forEach((el) => {
      counterObserver?.observe(el);
    });
}

/**
 * Initialize process connector animations: grows `.process-connector` lines on scroll.
 */
export function initProcessConnectors() {
  if (typeof window === "undefined") return;

  processObserver?.disconnect();

  processObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          processObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll<HTMLElement>(".process-connector").forEach((el) => {
    processObserver?.observe(el);
  });
}

/**
 * Initialize scroll indicator fade: hides `.scroll-indicator` after user scrolls 200px.
 */
export function initScrollIndicator() {
  if (typeof window === "undefined") return;

  const indicator = document.querySelector<HTMLElement>(".scroll-indicator");
  if (!indicator) return;

  function handleScroll() {
    if (!indicator) return;
    if (window.scrollY > 200) {
      indicator.classList.add("hidden");
    } else {
      indicator.classList.remove("hidden");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
}

/**
 * Initialize button ripple effect on all `.btn-primary` elements.
 */
export function initButtonRipples() {
  if (typeof window === "undefined") return;

  function addRipple(e: MouseEvent) {
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }

  document.querySelectorAll<HTMLElement>(".btn-ripple-target").forEach((btn) => {
    btn.removeEventListener("click", addRipple as EventListener);
    btn.addEventListener("click", addRipple as EventListener);
  });
}

/**
 * Run all init functions. Call once on client after hydration.
 */
export function initAllAnimations() {
  initScrollReveal();
  initCounterAnimations();
  initProcessConnectors();
  initScrollIndicator();
  initButtonRipples();
}
