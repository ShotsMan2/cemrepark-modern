"use client";
import { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getValidImageUrl } from "../../utils/imageHelper";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, formatPrice, t } = useStore();
  const { data: session } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.fiyat * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE = 49.90;
  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount = cartTotal + shippingCost;

  const getCardType = (number) => {
    const num = number.replace(/\s/g, "");
    if (num.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "MASTERCARD";
    if (/^9792/.test(num) || /^65/.test(num)) return "TROY";
    if (/^3[47]/.test(num)) return "AMEX";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format card number
    if (name === "cardNumber") {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      const matches = v.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || "";
      let parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        setFormData({ ...formData, cardNumber: parts.join(" ") });
        return;
      } else {
        setFormData({ ...formData, cardNumber: value });
        return;
      }
    }

    // Format expiry
    if (name === "cardExpiry") {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      if (v.length >= 2) {
        setFormData({ ...formData, cardExpiry: `${v.substring(0, 2)}/${v.substring(2, 4)}` });
      } else {
        setFormData({ ...formData, cardExpiry: v });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderPayload = {
        customer: formData.fullName,
        userId: session?.user?.id ? parseInt(session.user.id) : null,
        total: totalAmount,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Sipariş oluşturulamadı.");
      }

      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({
          title: t("order_success") || "Siparişiniz Alındı!",
          text: t("order_success_desc") || "Siparişiniz başarıyla oluşturuldu. En kısa sürede kargoya verilecektir.",
          icon: "success",
          background: "#1a1a1a",
          color: "#fff",
          confirmButtonColor: "#ff007f",
          confirmButtonText: t("back_to_home") || "Ana Sayfaya Dön",
        }).then(() => {
          if (clearCart) clearCart();
          router.push("/");
        });
      }
    } catch (error) {
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({
          title: "Hata",
          text: error.message || "Siparişiniz oluşturulurken bir hata oluştu.",
          icon: "error",
          background: "#1a1a1a",
          color: "#fff",
          confirmButtonColor: "#ff007f",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded || cartItems.length === 0) return null;

  return (
    <div className="min-h-[70vh] pt-24 pb-12 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-neon-pink opacity-5 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-widest uppercase text-glow-pink text-center">
          {t("checkout_title")}
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto">
          {/* LEFT: PAYMENT FORM */}
          <div className="w-full lg:w-2/3" data-aos="fade-right" data-aos-duration="800">
            <form onSubmit={handlePayment} className="space-y-8">
              {/* Teslimat Bilgileri */}
              <div className="glass-panel p-6 md:p-8 rounded-xl border border-black/5 dark:border-white/5">
                <h2 className="text-xl font-bold mb-6 text-holo-gold border-b border-black/10 dark:border-white/10 pb-4">
                  1. {t("shipping_info")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t("full_name")}</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      aria-label={t("full_name")}
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder={t("full_name")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">E-mail</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      aria-label="E-mail"
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t("phone")}</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      aria-label={t("phone")}
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder="0 (5XX) XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t("district")} / {t("city")}
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      aria-label={`${t("district")} / ${t("city")}`}
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder={t("city")}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t("address")}</label>
                    <textarea
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      aria-label={t("address")}
                      rows="3"
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:border-neon-pink transition-colors resize-none"
                      placeholder={t("address")}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Kredi Kartı Bilgileri */}
              <div className="glass-panel p-6 md:p-8 rounded-xl border border-black/5 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-gray-900 dark:text-white">
                  <svg
                    width="100"
                    height="100"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>

                <h2 className="text-xl font-bold mb-6 text-holo-gold border-b border-black/10 dark:border-white/10 pb-4">
                  2. {t("payment_info")}
                </h2>

                {/* Credit Card Mock Visual */}
                <div className="w-full max-w-sm mx-auto mb-8 h-52 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="flex justify-between items-start z-10">
                    <svg
                      width="40"
                      height="30"
                      viewBox="0 0 40 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="40" height="30" rx="4" fill="#ffd700" fillOpacity="0.8" />
                      <rect
                        x="5"
                        y="5"
                        width="10"
                        height="20"
                        rx="1"
                        fill="#fff"
                        fillOpacity="0.3"
                      />
                      <rect
                        x="25"
                        y="5"
                        width="10"
                        height="20"
                        rx="1"
                        fill="#fff"
                        fillOpacity="0.3"
                      />
                    </svg>
                    <div className="text-white/80 text-xl font-bold italic tracking-wider">
                      {getCardType(formData.cardNumber)}
                    </div>
                  </div>
                  <div className="z-10">
                    <div className="text-white text-xl md:text-2xl tracking-[0.2em] font-mono mb-2">
                      {formData.cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm uppercase">
                      <span className="truncate max-w-[150px]">
                        {formData.fullName || t("full_name")}
                      </span>
                      <span>{formData.cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t("card_number")}</label>
                    <input
                      required
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      aria-label={t("card_number")}
                      maxLength="19"
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white font-mono focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t("expiry")}</label>
                    <input
                      required
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      aria-label={t("expiry")}
                      maxLength="5"
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white font-mono focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t("cvv")}</label>
                    <input
                      required
                      type="text"
                      name="cardCvv"
                      value={formData.cardCvv}
                      onChange={handleInputChange}
                      aria-label={t("cvv")}
                      maxLength="3"
                      className="w-full bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white font-mono focus:outline-none focus:border-neon-pink transition-colors"
                      placeholder="***"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-neon-pink text-white hover:bg-white hover:text-neon-pink py-4 rounded-lg uppercase font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>{formatPrice(totalAmount)}</span> {t("complete_order")}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {t("ssl_guarantee")}
              </div>
            </form>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-1/3" data-aos="fade-left" data-aos-duration="800" data-aos-delay="200">
            <div className="glass-panel p-6 md:p-8 border border-black/5 dark:border-white/5 sticky top-32">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-widest border-b border-black/10 dark:border-white/10 pb-4">
                {t("order_summary")}
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-black/5 dark:bg-white/5 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={getValidImageUrl(item.gorsel)}
                        alt={item.ad}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{t(item.ad)}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {t("size")}: {item.beden} | {t("color")}: {item.renk}
                      </p>
                      <p className="text-xs text-neon-pink font-bold mt-1">
                        {item.quantity} x {formatPrice(item.fiyat)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-black/10 dark:bg-white/10 mb-6"></div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("subtotal")}</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t("shipping")}</span>
                  {shippingCost === 0 ? (
                    <span className="text-neon-pink font-bold">{t("free")}</span>
                  ) : (
                    <span className="text-gray-900 dark:text-white">{formatPrice(shippingCost)}</span>
                  )}
                </div>
                {shippingCost > 0 && (
                  <div className="text-xs text-neon-pink mt-1 italic">
                    {formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)} tutarında daha ürün ekleyin, kargo bedava olsun!
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-900 dark:text-white font-bold">{t("total")}</span>
                <span className="text-glow-gold font-black text-2xl">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
