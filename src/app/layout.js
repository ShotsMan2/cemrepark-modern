import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
// Removed old theme
// Removed old style
import "swiper/css";
import "aos/dist/aos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SvgDefs from "../components/SvgDefs";
import AOSInitializer from "../components/AOSInitializer";
import { StoreProvider } from "../context/StoreContext";
import MaintenanceGuard from "../components/MaintenanceGuard";
import AuthProvider from "../components/AuthProvider";
import Script from "next/script";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus" });

import { getSettings } from "../data/settings";

export async function generateMetadata() {
  const settings = getSettings();
  const siteAdi = settings.siteAdi || "Cemre Park";
  const defaultTitle = `${siteAdi} - Size çok yakışacak! 💫`;
  const defaultDescription = `${siteAdi} Online Mağaza`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteAdi}`,
    },
    description: defaultDescription,
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: baseUrl,
      siteName: siteAdi,
      images: [
        {
          url: "/assets/siteimg/cemre park.png", // Default OG image
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
  };
}

export default function RootLayout({ children }) {
  const settings = getSettings();
  return (
    <html lang="tr">
      <head>
        {settings.ozelCss && <style dangerouslySetInnerHTML={{ __html: settings.ozelCss }} />}
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${jost.variable} ${marcellus.variable} homepage`}>
        <AuthProvider>
          <StoreProvider>
            <MaintenanceGuard>
              <AOSInitializer />
              <SvgDefs />
              <Header />

              {children}

              <Footer />
            </MaintenanceGuard>
          </StoreProvider>
        </AuthProvider>

        <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="afterInteractive" />
        <Script
          src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"
          strategy="afterInteractive"
        />
        <Script src="/js/plugins.js" strategy="afterInteractive" />
        <Script src="/js/SmoothScroll.js" strategy="afterInteractive" />
        <Script src="/js/script.min.js" strategy="afterInteractive" />

        {/* AOS is now initialized via npm in AOSInitializer */}

        {/* Chatbot Integration */}
        <Script
          src="http://localhost:3000/embed.js?v=10"
          strategy="lazyOnload"
          data-color="#ff007f"
          data-title="Cemre Park Asistan"
          data-model="qwen2.5-coder:latest"
          data-welcome="Değerli Cemre Park Müşterisi, alışveriş asistanınıza hoş geldiniz! Size nasıl yardımcı olabilirim?"
        />
      </body>
    </html>
  );
}
