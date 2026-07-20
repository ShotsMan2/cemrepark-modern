"use client";
import { motion } from "framer-motion";

import { memo } from "react";
export default memo(function NewsletterSignup() {
  return (
    <section className="py-20 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary/10 blur-[120px] rounded-[100%] pointer-events-none"></div>

      <div className="container-premium relative z-10">
        <motion.div
          className="glass-card max-w-4xl mx-auto p-10 md:p-14 text-center overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 blur-3xl rounded-full"></div>

          <span className="badge-premium bg-primary/10 text-primary mb-6">Özel Fırsatlar</span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-foreground mb-4">
            VIP Bültenimize Katılın
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8 font-medium">
            Yeni koleksiyonlardan ilk siz haberdar olun! Sadece abonelerimize özel indirim kodları
            ve sürpriz fırsatları kaçırmayın.
          </p>

          <form
            className="max-w-md mx-auto relative flex items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="E-posta adresiniz..."
              className="w-full input-premium pr-[140px]"
              required
            />
            <button type="submit" className="absolute right-1.5 btn-premium py-2.5 px-6 text-sm">
              Abone Ol
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">
            İstediğiniz zaman abonelikten ayrılabilirsiniz.
          </p>
        </motion.div>
      </div>
    </section>
  );
});
