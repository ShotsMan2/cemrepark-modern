"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Storefront Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-screen animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="glass-panel p-10 text-center relative overflow-hidden">
          {/* Animated Illustration */}
          <div className="mb-8 relative flex justify-center items-center h-40">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5,
                ease: "easeInOut" 
              }}
              className="text-8xl text-primary/80 drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]"
            >
              ⚠️
            </motion.div>
            
            <div className="absolute w-24 h-24 bg-primary/20 rounded-full blur-xl -z-10 animate-ping opacity-50" />
          </div>

          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Bir Şeyler Yanlış Gitti
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 font-body">
            İşleminiz sırasında beklenmedik bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-[0_0_20px_rgba(255,0,127,0.3)] hover:shadow-[0_0_30px_rgba(255,0,127,0.5)] transition-all duration-300 active:scale-95"
            >
              Tekrar Dene
            </button>
            
            <Link 
              href="/"
              className="px-8 py-3 bg-white/10 dark:bg-white/5 border border-white/20 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur-md active:scale-95"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
