"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AOSInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if AOS is loaded
    if (typeof window !== 'undefined' && window.AOS) {
      // Re-initialize and refresh AOS on route change
      window.AOS.init({ duration: 800, once: true, offset: 100 });
      window.AOS.refresh();
      
      // Sometimes elements are still rendering, a slight delay helps
      setTimeout(() => {
        window.AOS.refresh();
      }, 100);
      
      setTimeout(() => {
        window.AOS.refresh();
      }, 500);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
