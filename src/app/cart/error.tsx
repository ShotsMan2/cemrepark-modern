"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cart Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-danger"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-foreground">Sepet Yüklenemedi</h2>
        <p className="text-foreground/60 text-sm">
          {error.message || "Sepet bilgilerinizi alırken bir sorun oluştu. Lütfen tekrar deneyin."}
        </p>

        <div className="flex flex-col space-y-3 pt-4">
          <button onClick={() => reset()} className="w-full btn-premium">
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="w-full py-3 px-4 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-medium transition-all"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}
