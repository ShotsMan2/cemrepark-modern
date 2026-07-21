"use client";
import { motion } from "framer-motion";
import { useStore } from "../../context/StoreContext";

import { memo } from "react";
export default memo(function TestimonialsSection() {
  return (
    <section className="py-16 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="container-premium relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">
            Müşteri Yorumları
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-display text-foreground mb-4">
            Sizden Gelenler
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4"></div>
        </motion.div>

        {/* Rating Distribution Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-16 glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center md:text-left flex-shrink-0">
            <div className="text-5xl font-black font-display text-foreground">4.9</div>
            <div className="flex gap-1 text-secondary my-2 justify-center md:justify-start">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-sm text-gray-500">1,250+ Değerlendirme</div>
          </div>
          <div className="flex-grow w-full space-y-2">
            {[
              { star: 5, pct: 92 },
              { star: 4, pct: 6 },
              { star: 3, pct: 2 },
              { star: 2, pct: 0 },
              { star: 1, pct: 0 },
            ].map((row) => (
              <div key={row.star} className="flex items-center gap-3 text-sm">
                <span className="font-medium w-8">{row.star} Y.</span>
                <div className="flex-grow h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-secondary"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <span className="text-gray-500 w-8 text-right">{row.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Ayşe Y.",
              text: "Ürünlerin kalitesi muazzam. Paketleme çok özenliydi ve kargom ertesi gün elime ulaştı. Kesinlikle favori mağazam!",
              stars: 5,
              date: "2 gün önce",
            },
            {
              name: "Zeynep K.",
              text: "Müşteri hizmetleri çok ilgiliydi. Beden değişimi sürecinde bana çok yardımcı oldular. Kabanın duruşu harika.",
              stars: 5,
              date: "1 hafta önce",
            },
            {
              name: "Fatma T.",
              text: "Fotoğraflarda göründüğünden bile daha güzel bir elbise. Kumaşı kaliteli, üzerimde tam durdu. Herkese tavsiye ederim.",
              stars: 5,
              date: "2 hafta önce",
            },
          ].map((review, i) => (
            <motion.div
              key={i}
              className="glass-panel p-8 rounded-2xl relative group hover:-translate-y-4 transition-transform duration-500 hover:shadow-xl hover:border-primary/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="absolute -top-6 left-8 text-6xl text-primary opacity-20 font-serif">
                &quot;
              </div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      className="w-4 h-4 text-secondary drop-shadow-md"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">{review.date}</span>
              </div>

              <p className="text-foreground/80 mb-6 leading-relaxed text-sm md:text-base relative z-10">
                {review.text}
              </p>

              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-glass-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-foreground font-black shadow-lg text-base">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-foreground font-bold tracking-wide">{review.name}</h4>
                  <div className="badge-premium bg-green-500/10 text-green-600 dark:text-green-400 mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Doğrulanmış Alıcı
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
