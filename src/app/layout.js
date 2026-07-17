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
import ThemeProvider from "../components/ThemeProvider";
import Script from "next/script";
import AIChatWidget from "../components/ui/AIChatWidget";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

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

export default async function RootLayout({ children }) {
  const settings = getSettings();
  const session = await getServerSession(authOptions);
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${jost.variable} ${marcellus.variable} homepage`}>
        {settings.ozelCss ? <style dangerouslySetInnerHTML={{ __html: settings.ozelCss }} /> : null}
        <AuthProvider session={session}>
          <StoreProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <MaintenanceGuard>
                <AOSInitializer />
                <SvgDefs />
                <Header />

                {children}

                <Footer />
                <AIChatWidget />
              </MaintenanceGuard>
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>

        {/* AOS is now initialized via npm in AOSInitializer */}
      </body>
    </html>
  );
}
