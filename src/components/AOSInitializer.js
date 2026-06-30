"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AOS from 'aos';

export default function AOSInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });
    AOS.refresh();
    
    // Sometimes elements are still rendering, a slight delay helps
    setTimeout(() => {
      AOS.refresh();
    }, 100);
    
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, [pathname]);

  return null; // This component doesn't render anything
}
