"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminNotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative bg-background">
      <div className="glass-card p-12 flex flex-col items-center text-center max-w-2xl w-full">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <h1 className="text-6xl font-black text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground/80 mb-4">Panel Sayfası Bulunamadı</h2>

        <p className="text-foreground/60 mb-8 max-w-md">
          Erişmeye çalıştığınız yönetim paneli sayfası mevcut değil veya taşınmış olabilir.
        </p>

        <Link href="/admin" className="btn-premium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Dashboard'a Dön
        </Link>
      </div>
    </div>
  );
}
