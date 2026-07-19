"use client";

import { memo } from "react";
export default memo(function MarqueeSection() {
  return (
    <section className="py-4 mb-12 border-y border-white/10 bg-white/50 dark:bg-black/50 overflow-hidden backdrop-blur-md relative z-20">
      <div className="w-full whitespace-nowrap animate-marquee flex gap-20 items-center opacity-60">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-20 items-center">
            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">
              Shopier
            </h4>
            <span className="text-primary text-lg">{"\u2726"}</span>
            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">
              {"Yurti\u00E7i Kargo"}
            </h4>
            <span className="text-primary text-lg">{"\u2726"}</span>
            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">
              Visa
            </h4>
            <span className="text-primary text-lg">{"\u2726"}</span>
            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] font-display">
              Mastercard
            </h4>
            <span className="text-primary text-xl">{"\u2726"}</span>
          </div>
        ))}
      </div>
    </section>
  );
});
