"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  hover = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        hover ? "glass-card" : "glass-card-static",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
