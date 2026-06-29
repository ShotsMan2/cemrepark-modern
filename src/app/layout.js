import { Jost, Marcellus } from "next/font/google";
import "./globals.css";
import "../../public/css/2031-theme.css";
import "../../public/css/style.css";
import "swiper/css";
import "aos/dist/aos.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SvgDefs from "../components/SvgDefs";
import SearchPopup from "../components/SearchPopup";
import Script from "next/script";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const marcellus = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-marcellus" });

export const metadata = {
  title: "Cemre Park - Tesettür Giyimde Şıklık ve Kalite",
  description: "Cemre Park online mağaza",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${jost.variable} ${marcellus.variable} homepage`}>
        <SvgDefs />
        <SearchPopup />
        <Header />
        
        {children}
        
        <Footer />
        
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="afterInteractive" />
        <Script src="/js/plugins.js" strategy="afterInteractive" />
        <Script src="/js/SmoothScroll.js" strategy="afterInteractive" />
        <Script src="/js/script.min.js" strategy="afterInteractive" />
        
        {/* Initialize AOS globally */}
        <Script id="init-aos" strategy="lazyOnload">
          {`
            if(window.AOS) {
              window.AOS.init({ duration: 800, once: true, offset: 100 });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
