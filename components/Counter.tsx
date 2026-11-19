"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export function Counter({ value, label, suffix = "" }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * value);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-2xl font-bold text-inter text-foreground">{displayValue}{suffix}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}