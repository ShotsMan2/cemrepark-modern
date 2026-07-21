"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorDetails, setErrorDetails] = useState<string>("");

  useEffect(() => {
    console.error("App Error:", error);
    console.error("Error Digest:", error.digest);
    setErrorDetails(error.message || "Bilinmeyen hata");
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full glass-panel rounded-3xl shadow-elevated border border-glass-border p-8 text-center space-y-6">
        <motion.div
          className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -5, 0] }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
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
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground">Bir Şeyler Yanlış Gitti</h2>
        <p className="text-foreground/60 text-sm">
          Beklenmedik bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>

        <div className="flex flex-col space-y-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-primary text-foreground rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="w-full py-3 px-4 bg-foreground/5 text-foreground rounded-xl font-medium transition-all hover:bg-foreground/10 border border-glass-border"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
