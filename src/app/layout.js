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
import Script from "next/script";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus" });

export const metadata = {
  title: "Cemre Park - Size çok yakışıcak! 💫",
  description: "Cemre Park Online Mağaza",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${jost.variable} ${marcellus.variable} homepage`}>
        <StoreProvider>
          <AOSInitializer />
          <SvgDefs />
          <Header />
          
          {children}
          
          <Footer />
        </StoreProvider>
        
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js" strategy="afterInteractive" />
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
