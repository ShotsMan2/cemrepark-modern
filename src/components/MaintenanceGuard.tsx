"use client";
import { useStore } from "../context/StoreContext";
import { usePathname } from "next/navigation";
import React from "react";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded } = useStore();
  const pathname = usePathname();

  if (!isLoaded || !settings) return <>{children}</>;

  const isAdmin = pathname?.startsWith("/admin");

  if (settings.bakimModu && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="glass-panel p-12 max-w-xl w-full clip-angled relative z-10 border border-white/10">
          <div className="w-20 h-20 rounded-full border border-red-500/30 bg-red-500/5 mx-auto flex items-center justify-center mb-8 animate-pulse">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-4">
            Bakım Modu
          </h1>
          <div className="w-16 h-1 bg-neon-pink mx-auto mb-6"></div>

          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Sitemiz şu anda güncelleniyor. Size daha iyi bir deneyim sunmak için kısa bir süreliğine
            bakım modundayız. Lütfen daha sonra tekrar deneyin.
          </p>

          <div className="text-xs text-gray-600 uppercase tracking-widest">
            {settings.siteAdi || "Cemre Park"} Yönetimi
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
