import HomeClient from "./HomeClient";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/data/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";
  return {
    title: `${siteAdi} - Size çok yakışacak! 💫`,
    description: `${siteAdi} - En yeni tesettür giyim ve moda ürünleri. Güvenli alışveriş, hızlı kargo.`,
  };
}

export default async function Home() {
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let products = [];
  try {
    products = await prisma.product.findMany({
      take: 8,
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("Ürünler çekilirken hata:", error);
  }

  const bestSellers = products.slice(0, 4);
  const discounted = products.slice(4, 8);

  let banners = [];
  try {
    banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch banners in page.js:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteAdi,
        url: baseUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: siteAdi,
        url: baseUrl,
        logo: `${baseUrl}/assets/siteimg/cemre park.png`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: settings.telefon,
          contactType: "customer service",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient bestSellers={bestSellers} discounted={discounted} banners={banners} />
    </>
  );
}
