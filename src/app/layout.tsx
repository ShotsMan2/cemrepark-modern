import { Jost, Marcellus, Inter } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "aos/dist/aos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SvgDefs from "../components/SvgDefs";
import AOSInitializer from "../components/AOSInitializer";
import { StoreProvider } from "../context/StoreContext";
import MaintenanceGuard from "../components/MaintenanceGuard";
import AuthProvider from "../components/AuthProvider";
import ThemeProvider from "../components/ThemeProvider";
import Script from "next/script";
import { AIChatWidget } from "../components/ui/AIChatWidget";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import PageTransitionWrapper from "../components/PageTransitionWrapper";
import ScrollToTop from "../components/ui/ScrollToTop";
import BackToTop from "../components/ui/BackToTop";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

import { getSettings } from "../data/settings";

export async function generateMetadata() {
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";
  const defaultTitle = `${siteAdi} - Size çok yakışacak!`;
  const defaultDescription = `${siteAdi} Online Mağaza - Tesettür giyim, elbise, tunik, pantolon ve daha fazlası`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteAdi}`,
    },
    description: defaultDescription,
    keywords: ["tesettür giyim", "hijab clothing", "moda", "elbise", "tunik", "cemre park"],
    authors: [{ name: siteAdi }],
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: baseUrl,
      siteName: siteAdi,
      images: [
        {
          url: "/assets/siteimg/cemre park.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: ["/assets/siteimg/cemre park.png"],
    },
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = getSettings();
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("Session fetch failed:", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteAdi || "Cemre Park",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/assets/siteimg/cemre park.png`,
    sameAs: [
      "https://instagram.com/cemrepark",
      `https://wa.me/90${(settings?.destekTelefonu || "05541698909").replace(/\s+/g, "")}`,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.destekTelefonu || "0554 169 89 09",
      contactType: "customer service",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000" },
    ],
  };

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </head>
      <body className={`${jost.variable} ${marcellus.variable} ${inter.variable} homepage`}>
        {settings.ozelCss ? <style dangerouslySetInnerHTML={{ __html: settings.ozelCss }} /> : null}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-primary focus:text-foreground focus:rounded-xl focus:shadow-lg focus:outline-none focus:font-bold"
        >
          Ana içeriğe geç
        </a>
        <AuthProvider session={session}>
          <StoreProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
              <MaintenanceGuard>
                <AOSInitializer />
                <SvgDefs />
                <Header />
                <main id="main-content">
                  <PageTransitionWrapper>
                    {children}
                  </PageTransitionWrapper>
                </main>
                <Footer />
                <ScrollToTop />
                <BackToTop />
                <AIChatWidget />
              </MaintenanceGuard>
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
