"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isLoading && (
        <motion.div
          key="loading-screen"
          exit={{
            y: "-100vh",
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="fixed inset-0 z-[100] bg-bg-primary flex flex-col items-center justify-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-display text-5xl gold-gradient-text-animated mb-8"
          >
            APEX
          </motion.span>

          <div className="w-48 h-[2px] bg-[rgba(212,175,55,0.15)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                ease: "easeInOut",
              }}
              className="h-full bg-gold-gradient rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
