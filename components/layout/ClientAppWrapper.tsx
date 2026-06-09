"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ReactLenis, useLenis } from "lenis/react";
import { initAllAnimations } from "@/lib/scrollAnimations";
import { LoadingScreen } from "./LoadingScreen";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyMobileCTA } from "./StickyMobileCTA";

function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const lenis = useLenis();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current && lenis) {
      prevPathname.current = pathname;
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  }, [pathname, lenis]);

  return null;
}

export function ClientAppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [initialLoad, setInitialLoad] = useState(true);

  // Only show loading screen on first visit
  useEffect(() => {
    const t = setTimeout(() => setInitialLoad(false), 2200);
    return () => clearTimeout(t);
  }, []);

  // Run scroll animations after each route change
  useEffect(() => {
    const t = setTimeout(() => initAllAnimations(), 120);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      }}
    >
      <ScrollToTopOnRouteChange />
      {initialLoad && <LoadingScreen />}
      <Navbar />
      <main className="relative z-10">
        <AnimatePresence mode="sync">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <StickyMobileCTA />
    </ReactLenis>
  );
}
