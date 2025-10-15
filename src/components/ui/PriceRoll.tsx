"use client";
import DigitRoll from "./DigitRoll";

export default function PriceRoll({ cents }: { cents: number }) {
  const s = (cents / 100).toFixed(2); // e.g. "2.39"
  const chars = `$${s}`.split(""); // ['$','2','.','3','9']

  return (
    <span className="inline-flex items-center gap-[2px]">
      {chars.map((ch, i) => {
        if (ch === "$") {
          return (
            <span key={`$-${i}`} className="mr-1 font-semibold">
              $
            </span>
          );
        }
        if (ch === ".") {
          return (
            <span key={`dot-${i}`} className="inline-block w-2 text-center font-mono">
              .
            </span>
          );
        }
        return <DigitRoll key={`${ch}-${i}`} value={ch} />;
      })}
    </span>
  );
}

