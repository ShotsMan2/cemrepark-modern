"use client";

import { useStore } from "../../../context/StoreContext";
import ContactForm from "../../../components/ContactForm";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function KurumsalContentClient({ slug, settings: ssrSettings, dynamicPage }) {
  const { t, settings: storeSettings } = useStore();
  const settings = storeSettings || ssrSettings;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const contentMap = {
    hakkimizda: {
      title: t("about_us"),
      content: (
        <div className="space-y-6" data-aos="fade-up">
          <p className="text-gray-900 dark:text-white leading-relaxed text-lg">{t("about_us_p1")}</p>
          <p className="text-gray-900 dark:text-white leading-relaxed text-lg">{t("about_us_p2")}</p>
          <div className="p-8 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 clip-angled my-10 relative overflow-hidden" data-aos="fade-right" data-aos-delay="200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink opacity-10 rounded-bl-full"></div>
            <h3 className="text-gray-900 dark:text-white font-bold text-xl uppercase tracking-widest mb-4">
              {t("our_vision_title")}
            </h3>
            <p className="text-gray-700 dark:text-gray-200">{t("our_vision_desc")}</p>
          </div>
        </div>
      ),
    },
    iletisim: {
      title: t("contact_us"),
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8" data-aos="fade-right">
            <p className="text-gray-900 dark:text-white leading-relaxed text-lg">{t("contact_intro")}</p>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 border border-holo-gold flex items-center justify-center text-holo-gold clip-angled">
                  M
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-wider text-sm">
                    {t("email_title")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-200">
                    {settings?.iletisimEposta || "info@cemrepark.com"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 border border-neon-pink flex items-center justify-center text-neon-pink clip-angled">
                  T
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-wider text-sm">
                    {t("phone_title")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-200">{settings?.destekTelefonu || "0554 169 89 09"}</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center text-gray-900 dark:text-white clip-angled">
                  A
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-wider text-sm">
                    {t("address_title")}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-200">
                    {settings?.adres || "Moda Sokak No: 123, Tekstil Merkezi, İstanbul"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 clip-angled" data-aos="fade-left" data-aos-delay="200">
            <ContactForm />
          </div>
        </div>
      ),
    },
    "mesafeli-satis-sozlesmesi": {
      title: t("distance_selling"),
      content: (
        <div className="space-y-8" data-aos="fade-up">
          <p className="text-gray-900 dark:text-gray-200 text-sm leading-relaxed">{t("distance_selling_text")}</p>
        </div>
      ),
    },
    "iade-ve-degisim-kosullari": {
      title: t("return_policy"),
      content: (
        <div className="space-y-8" data-aos="fade-up">
          <p className="text-gray-900 dark:text-gray-200 text-sm leading-relaxed">{t("return_policy_text")}</p>
        </div>
      ),
    },
    "gizlilik-politikasi": {
      title: t("privacy_policy"),
      content: (
        <div className="space-y-8" data-aos="fade-up">
          <p className="text-gray-900 dark:text-gray-200 text-sm leading-relaxed">{t("privacy_policy_text")}</p>
        </div>
      ),
    },
  };

  let pageData = null;

  if (dynamicPage) {
    pageData = {
      title: dynamicPage.title,
      content: (
        <div className="space-y-8" data-aos="fade-up">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: dynamicPage.content }} />
        </div>
      ),
    };
  } else {
    pageData = contentMap[slug];
  }

  if (!pageData) {
    return null; // The server component handles notFound()
  }

  return (
    <>
      <div className="mb-12" data-aos="fade-down">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
          {pageData.title}
        </h1>
        <div className="h-1 w-20 bg-neon-pink" data-aos="fade-right" data-aos-delay="300"></div>
      </div>

      <div className="glass-panel p-8 md:p-12 clip-angled" data-aos="fade-up" data-aos-delay="100">
        {pageData.content}
      </div>
    </>
  );
}
