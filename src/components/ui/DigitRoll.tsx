"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string; // single char 0-9 or '.'
  durationMs?: number; // animation duration
};

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function DigitRoll({ value, durationMs = 350 }: Props) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value === prev.current) return;
    // Only roll for numeric digits
    if (/\d/.test(value) && /\d/.test(prev.current)) {
      setAnimating(true);
      const id = setTimeout(() => {
        setAnimating(false);
        setDisplay(value);
        prev.current = value;
      }, durationMs);
      return () => clearTimeout(id);
    } else {
      // dot or non-digit: snap
      setDisplay(value);
      prev.current = value;
    }
  }, [value, durationMs]);

  const current = animating ? prev.current : display;
  const next = value;

  // container styles
  const base =
    "relative inline-block w-5 h-7 overflow-hidden rounded bg-white/70 border border-black/10 shadow-sm";
  const digitStyle =
    "flex items-center justify-center font-mono text-[15px] leading-none";

  return (
    <span className={base} aria-hidden>
      <span
        className={`${digitStyle} absolute inset-0 transition-transform`}
        style={{
          transform: animating ? "translateY(-100%)" : "translateY(0)",
          transitionDuration: `${durationMs}ms`,
        }}
      >
        {current}
      </span>
      <span
        className={`${digitStyle} absolute inset-0 translate-y-full transition-transform`}
        style={{
          transform: animating ? "translateY(0)" : "translateY(100%)",
          transitionDuration: `${durationMs}ms`,
        }}
      >
        {next}
      </span>
    </span>
  );
}

