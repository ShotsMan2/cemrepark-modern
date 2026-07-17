"use client";
import { useStore } from "../context/StoreContext";
import { useEffect, useState } from "react";

interface PriceDisplayProps {
  amount: number | string;
  className?: string;
}

export default function PriceDisplay({ amount, className = "" }: PriceDisplayProps) {
  const { formatPrice, isLoaded } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration mismatch, we render the TL format on the server,
  // and only use the dynamic formatting after the component mounts on the client.
  if (!mounted || !isLoaded) {
    const numPrice = typeof amount === "string" ? parseFloat(amount) : amount;
    return (
      <span className={className}>
        {(numPrice || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
        TL
      </span>
    );
  }

  return <span className={className}>{formatPrice(amount)}</span>;
}
