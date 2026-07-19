"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";

interface CountdownTimerProps {
  targetDate: string;
  title?: string;
}

export default function CountdownTimer({ targetDate, title }: CountdownTimerProps) {
  const { t } = useStore();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex-1 text-center md:text-left z-10">
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">
          {title || t("flash_sale") || "GÜNÜN FIRSATI"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t("flash_sale_desc") || "Seçili ürünlerde sepette %20 ek indirim. Acele edin, fırsatı kaçırmayın!"}
        </p>
      </div>

      <div className="flex gap-4 z-10">
        {[
          { label: t("days") || "Gün", value: timeLeft.days },
          { label: t("hours") || "Saat", value: timeLeft.hours },
          { label: t("minutes") || "Dakika", value: timeLeft.minutes },
          { label: t("seconds") || "Saniye", value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 flex items-center justify-center shadow-lg mb-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="text-2xl md:text-3xl font-black text-primary relative z-10">
                {item.value.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
