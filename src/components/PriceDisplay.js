"use client";
import { useStore } from "../context/StoreContext";
import { useEffect, useState } from "react";

export default function PriceDisplay({ amount, className = "" }) {
  const { formatPrice, isLoaded } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration mismatch, we render the TL format on the server,
  // and only use the dynamic formatting after the component mounts on the client.
  if (!mounted || !isLoaded) {
    const numPrice = parseFloat(amount) || 0;
    return (
      <span className={className}>
        {numPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
        TL
      </span>
    );
  }

  return <span className={className}>{formatPrice(amount)}</span>;
}
