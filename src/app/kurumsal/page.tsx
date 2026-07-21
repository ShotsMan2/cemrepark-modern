import { getSettings } from "@/data/settings";
import KurumsalClient from "./KurumsalClient";

export async function generateMetadata() {
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";

  return {
    title: `Kurumsal | ${siteAdi}`,
    description: `${siteAdi} kurumsal bilgileri, hakkımızda, vizyon, misyon ve değerlerimiz.`,
  };
}

export default function KurumsalPage() {
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/kurumsal`,
    },
    name: `Kurumsal - ${siteAdi}`,
    description: `${siteAdi} kurumsal bilgileri, hakkımızda, vizyon, misyon ve değerlerimiz.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KurumsalClient />
    </>
  );
}
