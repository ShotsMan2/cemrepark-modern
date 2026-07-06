"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";

export default function SiparislerimClient({ orders }) {
  const { t, formatPrice, language } = useStore();

  const getStatusColorClass = (status) => {
    if (status === "Tamamlandı") return "bg-green-500/20 text-green-400";
    if (status === "İptal Edildi" || status === "İptal") return "bg-red-500/20 text-red-400";
    return "bg-blue-500/20 text-blue-400";
  };

  const getTranslatedStatus = (status) => {
    if (status === "Tamamlandı") return t("status_completed");
    if (status === "İptal Edildi" || status === "İptal") return t("status_cancelled");
    if (status === "Hazırlanıyor") return t("status_preparing");
    if (status === "Kargolandı") return t("status_shipped");
    if (status === "Teslim Edildi") return t("status_delivered");
    return status;
  };

  const getLocalDateString = (dateString) => {
    const date = new Date(dateString);
    const locale = language === "TR" ? "tr-TR" : language === "AR" ? "ar-EG" : "en-US";
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 relative z-10">
      <div className="mb-8">
        <Link href="/hesabim" className="text-gray-400 hover:text-neon-pink transition-colors text-sm uppercase tracking-wider flex items-center gap-2">
          <span>{language === "AR" ? "←" : "←"}</span> {t("back_to_my_account")}
        </Link>
      </div>

      <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">{t("my_orders")}</h1>
      <div className="w-24 h-1 bg-neon-pink mx-auto mb-12"></div>
      
      <div className="glass-panel p-8 clip-angled bg-black/40 border border-white/10 backdrop-blur-md">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">{t("no_orders_yet")}</p>
            <Link href="/" className="inline-block bg-neon-pink text-white font-bold py-3 px-8 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled">
              {t("start_shopping")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-white/10 bg-black/50 p-6 clip-angled flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-white font-bold text-lg mb-1">{t("order_no", { id: order.id })}</p>
                  <p className="text-gray-400 text-sm">{getLocalDateString(order.createdAt)}</p>
                </div>
                <div className="flex flex-col md:items-end">
                  <p className="text-glow-gold font-bold text-xl mb-1">{formatPrice(order.total)}</p>
                  <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 ${getStatusColorClass(order.status)}`}>
                    {getTranslatedStatus(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
