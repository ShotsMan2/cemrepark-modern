"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { useState } from "react";

export default function SiparislerimClient({ orders }) {
  const { t, formatPrice, language } = useStore();

  const getStatusColorClass = (status) => {
    if (status === "Tamamlandı")
      return "bg-success/10 dark:bg-success/20 text-success dark:text-success";
    if (status === "İptal Edildi" || status === "İptal")
      return "bg-danger/10 dark:bg-danger/20 text-danger dark:text-danger";
    return "bg-info/10 dark:bg-info/20 text-info dark:text-info";
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleOrder = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 relative z-10">
      <div className="mb-8">
        <Link
          href="/hesabim"
          className="text-foreground/70 hover:text-primary dark:hover:text-primary transition-colors text-sm uppercase tracking-wider flex items-center gap-2 font-medium"
        >
          <span>{language === "AR" ? "←" : "←"}</span> {t("back_to_my_account")}
        </Link>
      </div>

      <h1 className="text-4xl font-black text-foreground uppercase tracking-widest mb-4 text-center">
        {t("my_orders")}
      </h1>
      <div className="w-24 h-1 bg-primary mx-auto mb-12"></div>

      <div className="glass-panel p-8 clip-angled">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/70 mb-6 font-medium">{t("no_orders_yet")}</p>
            <Link
              href="/"
              className="inline-block bg-primary text-foreground font-bold py-3 px-8 uppercase tracking-widest hover:bg-gray-900 hover:text-foreground dark:hover:bg-white dark:hover:text-black transition-colors clip-angled cursor-pointer"
            >
              {t("start_shopping")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-black/[0.08] dark:border-white/10 bg-black/[0.03] dark:bg-black/50 p-6 clip-angled flex flex-col gap-4"
              >
                <div
                  className="flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div>
                    <p className="text-foreground font-bold text-lg mb-1">
                      {t("order_no", { id: order.id })}
                    </p>
                    <p className="text-foreground/70 text-sm font-medium">
                      {getLocalDateString(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end mt-4 md:mt-0">
                    <p className="text-glow-secondary font-bold text-xl mb-1">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={`text-xs uppercase tracking-widest font-bold px-3 py-1 ${getStatusColorClass(order.status)}`}
                    >
                      {getTranslatedStatus(order.status)}
                    </span>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 animate-fade-in">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-2">
                      Sipariş Detayı
                    </h3>
                    {order.trackingNumber && (
                      <div className="mb-4 bg-white/50 dark:bg-black/20 p-3 rounded">
                        <p className="text-sm">
                          <span className="font-bold">Kargo Firması:</span>{" "}
                          {order.carrier || "Belirtilmedi"}
                        </p>
                        <p className="text-sm">
                          <span className="font-bold">Takip Numarası:</span> {order.trackingNumber}
                        </p>
                      </div>
                    )}

                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm border-b border-black/5 dark:border-white/5 pb-2"
                          >
                            <span>
                              {item.quantity}x {item.product?.ad || "Ürün"}
                            </span>
                            <span className="font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
