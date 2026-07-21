"use client";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/context/StoreContext";

export default function SocialProofCounter() {
  const { t } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: "Mutlu Müşteri", value: 15000, suffix: "+" },
    { label: "Sipariş", value: 45000, suffix: "+" },
    { label: "Ürün Çeşidi", value: 850, suffix: "+" },
    { label: "Müşteri Puanı", value: 4.9, suffix: "/5", isFloat: true },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="py-10 bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-y border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-white/5 dark:bg-black/20 blur-3xl pointer-events-none"></div>

      <div className="container-premium relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 glass-panel rounded-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple mb-2">
                <Counter value={stat.value} isVisible={isVisible} isFloat={stat.isFloat} />
                <span className="text-xl md:text-2xl ml-1">{stat.suffix}</span>
              </div>
              <p className="text-xs md:text-sm text-foreground/70 font-bold uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Counter({
  value,
  isVisible,
  isFloat = false,
}: {
  value: number;
  isVisible: boolean;
  isFloat?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return <span>{isFloat ? count.toFixed(1) : Math.floor(count).toLocaleString("tr-TR")}</span>;
}
