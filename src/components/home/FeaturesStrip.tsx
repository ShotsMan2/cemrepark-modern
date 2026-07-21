"use client";
import { motion } from "framer-motion";

import { memo } from "react";
export default memo(function FeaturesStrip() {
  return (
    <section className="py-8 bg-background relative z-10 border-b border-glass-border">
      <div className="container-premium">
        <div className="flex gap-4 md:justify-between overflow-x-auto no-scrollbar pb-4 md:pb-0 snap-x">
          {[
            {
              icon: "\u{1F69A}",
              title: "\u00DCcretsiz Kargo",
              desc: "500 TL \u00FCzeri sipari\u015Flerde",
            },
            {
              icon: "\u{1F504}",
              title: "Kolay \u0130ade",
              desc: "14 g\u00FCn i\u00E7inde ko\u015Fulsuz iade",
            },
            {
              icon: "\u{1F4B3}",
              title: "G\u00FCvenli \u00D6deme",
              desc: "256-bit SSL korumas\u0131",
            },
            { icon: "\u{1F4F1}", title: "7/24 Destek", desc: "WhatsApp destek hatt\u0131" },
          ].map((feat, i) => (
            <motion.div
              key={i}
              className="flex-none w-[240px] md:w-auto flex items-center gap-4 glass-panel p-4 rounded-2xl snap-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                {feat.icon}
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
                  {feat.title}
                </h4>
                <p className="text-xs text-foreground/60 mt-1">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
