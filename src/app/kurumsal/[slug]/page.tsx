import { notFound } from "next/navigation";
import { getSettings } from "../../../data/settings";
import KurumsalContentClient from "./KurumsalContentClient";
import prisma from "@/lib/prisma";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";

  const page = await prisma.page.findUnique({ where: { slug } });

  const title = page ? page.title : slug.replace(/-/g, " ").toUpperCase();

  return {
    title: `${title} | ${siteAdi}`,
    description: `${siteAdi} ${title} sayfası.`,
  };
}

export default async function KurumsalPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const settings = getSettings();

  const page = await prisma.page.findUnique({
    where: { slug },
  });

  const validSlugs = [
    "hakkimizda",
    "iletisim",
    "mesafeli-satis-sozlesmesi",
    "iade-ve-degisim-kosullari",
    "gizlilik-politikasi",
    "vizyon-misyon",
    "surdurulebilirlik",
    "kariyer",
  ];

  if (!page && !validSlugs.includes(slug)) {
    notFound();
  }

  const title = page ? page.title : slug.replace(/-/g, " ").toUpperCase();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${title} - ${settings.siteAdi || "Cemre Park"}`,
    url: `${baseUrl}/kurumsal/${slug}`,
    description: `${settings.siteAdi || "Cemre Park"} ${title} sayfası.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen pt-32 pb-24 bg-background relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-pink opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <KurumsalContentClient slug={slug} settings={settings} dynamicPage={page} />
        </div>
      </div>
    </>
  );
}
