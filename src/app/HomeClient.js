"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "../context/StoreContext";
import CountdownTimer from "../components/ui/CountdownTimer";
import SocialProofCounter from "../components/ui/SocialProofCounter";

// Extracted Components
import HeroSection from "../components/home/HeroSection";
import MarqueeSection from "../components/home/MarqueeSection";
import FeaturesStrip from "../components/home/FeaturesStrip";
import CategoryShowcase from "../components/home/CategoryShowcase";
import BestSellersSection from "../components/home/BestSellersSection";
import BentoBoxShowcase from "../components/home/BentoBoxShowcase";
import NewsletterSignup from "../components/home/NewsletterSignup";
import TestimonialsSection from "../components/home/TestimonialsSection";

const QuickViewModal = dynamic(() => import("../components/QuickViewModal"), { ssr: false });

export default function HomeClient({ bestSellers, discounted, banners = [] }) {
  const { t } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const activeBanners = useMemo(() => banners.filter((b) => b.isActive), [banners]);

  const categories = useMemo(
    () => [
      {
        id: 1,
        name: "Elbise",
        count: "124+",
        image: "/assets/siteimg/yeni1.jpg",
        href: "/search?q=Elbise",
      },
      {
        id: 2,
        name: "Takım",
        count: "86+",
        image: "/assets/siteimg/yeni2.jpg",
        href: "/search?q=Takım",
      },
      {
        id: 3,
        name: "Tunik",
        count: "150+",
        image: "/assets/siteimg/yeni3.jpg",
        href: "/search?q=Tunik",
      },
      {
        id: 4,
        name: "Kaban",
        count: "45+",
        image: "/assets/siteimg/yeni4.jpg",
        href: "/search?q=Kaban",
      },
      {
        id: 5,
        name: "Pantolon",
        count: "98+",
        image: "/assets/siteimg/yeni1.jpg",
        href: "/search?q=Pantolon",
      },
    ],
    []
  );

  const [targetDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString());

  return (
    <div className="overflow-hidden">
      <HeroSection activeBanners={activeBanners} />
      <MarqueeSection />
      <FeaturesStrip />
      <CategoryShowcase categories={categories} />

      {/* FLASH SALE COUNTDOWN */}
      <section className="py-8 bg-background relative z-10">
        <div className="container-premium">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </section>

      <BestSellersSection bestSellers={bestSellers} setQuickViewProduct={setQuickViewProduct} />
      <BentoBoxShowcase discounted={discounted} />
      <SocialProofCounter />
      <NewsletterSignup />
      <TestimonialsSection />

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
