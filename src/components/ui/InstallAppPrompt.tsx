"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallAppPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if the prompt was previously dismissed
    const hasDismissed = localStorage.getItem('cemrepark_app_prompt_dismissed');
    
    // Listen for the beforeinstallprompt event (PWA)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!hasDismissed && isMobile) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Platform and standalone checks
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isMobile && !hasDismissed && !isStandalone && (isIos || !deferredPrompt)) {
      // Small delay so it doesn't pop up immediately on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile, deferredPrompt]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('cemrepark_app_prompt_dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    } else {
      // iOS or fallback instructions
      alert("Uygulamamızı yüklemek için tarayıcınızın 'Paylaş' (Share) menüsünden 'Ana Ekrana Ekle' (Add to Home Screen) seçeneğini kullanabilirsiniz.");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 150, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 left-4 right-4 z-[9999] md:hidden"
      >
        <div className="bg-gradient-to-r from-pink-900 to-pink-950 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-pink-500/30 backdrop-blur-xl relative overflow-hidden">
          
          {/* Subtle gold accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-1 border border-white/20 shadow-inner backdrop-blur-sm">
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-lg font-black text-white shadow-lg">
                CP
              </div>
            </div>
            
            <div className="flex flex-col">
              <h4 className="font-bold text-sm text-white tracking-wide">Cemre Park Uygulaması</h4>
              <p className="text-xs text-pink-200/90 font-medium">Daha hızlı alışveriş deneyimi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 ml-2">
            <button
              onClick={handleDismiss}
              className="p-1.5 text-pink-300/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              aria-label="Kapat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={handleInstall}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-pink-950 text-sm font-bold py-2 px-4 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)] transform transition-all active:scale-95 whitespace-nowrap"
            >
              Yükle
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
