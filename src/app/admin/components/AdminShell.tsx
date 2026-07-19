"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

const pathToTab = {
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
    <div className="min-h-screen flex bg-background relative overflow-hidden text-foreground">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary opacity-5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary opacity-5 rounded-full blur-[150px] pointer-events-none"></div>

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={() => {}}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        <header className="glass-frosted border-x-0 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div className="hidden md:flex items-center text-sm font-medium text-foreground/50 uppercase tracking-widest">
              <span>Admin Paneli</span>
              <span className="mx-2">/</span>
              <span className="text-primary font-bold">{activeTab.replace(/-/g, " ")}</span>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 pb-24 max-w-7xl mx-auto w-full animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
