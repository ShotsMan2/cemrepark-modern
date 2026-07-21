"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";

const pathToTab: Record<string, string> = {
  "/admin": "dashboard",
  "/admin/audit-logs": "audit-logs",
  "/admin/login-history": "login-history",
  "/admin/logs": "security",
  "/admin/banners": "banners",
  "/admin/pages": "pages",
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMainAdmin = pathname === "/admin";
  const activeTab = pathToTab[pathname] || "dashboard";

  if (isMainAdmin) {
    return children;
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden text-foreground selection:bg-primary/30">
      {/* Decorative Premium Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[180px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-accent/5 rounded-full blur-[200px] pointer-events-none mix-blend-screen"></div>

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={() => {}}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 scroll-smooth">
        <header className="glass-panel border-x-0 border-t-0 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 py-5 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors focus:outline-none bg-foreground/5 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18"></path>
              </svg>
            </motion.button>
            <div className="hidden md:flex items-center text-xs font-bold text-foreground/50 uppercase tracking-widest gap-2">
              <span className="hover:text-foreground transition-colors cursor-pointer">
                Admin Paneli
              </span>
              <span className="text-foreground/20">/</span>
              <motion.span
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-primary font-black drop-shadow-[0_0_8px_hsla(var(--primary),0.5)]"
              >
                {activeTab.replace(/-/g, " ")}
              </motion.span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Additional Header Actions can go here */}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 lg:p-10 pb-24 max-w-[1600px] mx-auto w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
