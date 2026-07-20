"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";

export default function AOSInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.init({ duration: 800, once: true, offset: 100 });
      AOS.refresh();

      setTimeout(() => AOS.refresh(), 200);
      setTimeout(() => AOS.refresh(), 500);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
