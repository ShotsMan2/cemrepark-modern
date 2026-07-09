"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";

export default function AOSInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Delay AOS initialization to allow React to complete hydration.
    // This prevents "hydration mismatch" errors caused by AOS adding 
    // 'aos-init' classes to elements before React finishes hydrating.
    const timer = setTimeout(() => {
      AOS.init({ duration: 800, once: true, offset: 100 });
      AOS.refresh();
      
      // Refresh again slightly later for elements that might render asynchronously
      setTimeout(() => AOS.refresh(), 200);
      setTimeout(() => AOS.refresh(), 500);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
