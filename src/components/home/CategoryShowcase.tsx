"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { memo } from "react";
export default memo(function CategoryShowcase({ categories }: { categories: any[] }) {
  return (
    <section className="py-14 mb-12 bg-background relative">
      <div className="container-premium">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-display font-black mb-2">Kategoriler</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary"></div>
          </div>
        </div>

        <motion.div
          className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex-none w-40 md:w-48 group snap-center cursor-pointer"
            >
              <div className="relative w-full aspect-square rounded-full mb-3 border-4 border-transparent hover:border-primary/50 transition-colors duration-500 shadow-xl p-2 glass-panel glow-ring">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                </div>
                <div className="absolute top-0 right-0 badge-premium bg-primary text-white shadow-lg z-10 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.count}
                </div>
              </div>
              <h3 className="text-center font-bold text-base uppercase tracking-wider group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
})

