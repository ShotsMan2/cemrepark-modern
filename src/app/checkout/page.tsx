"use client";

import { useState, useEffect } from "react";

import { useStore } from "../../context/StoreContext";

import { useRouter } from "next/navigation";

import Image from "next/image";

import { getValidImageUrl } from "../../utils/imageHelper";

import { useSession } from "next-auth/react";

import Swal from "sweetalert2";

import AOS from "aos";

import "aos/dist/aos.css";

import { motion, AnimatePresence } from "framer-motion";

import { z } from "zod";

import { ShieldCheck, Truck, RotateCcw, CreditCard, Banknote, Calendar } from "lucide-react";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),

  email: z.string().email("Geçerli bir e-posta adresi giriniz"),

  phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),

  city: z.string().min(2, "İl/İlçe zorunludur"),

  address: z.string().min(10, "Açık adres en az 10 karakter olmalıdır"),

  cardNumber: z.string().optional(),

  cardExpiry: z.string().optional(),

  cardCvv: z.string().optional(),
});

export default function CheckoutPage() {
  const router = useRouter();

  const { cartItems, clearCart, formatPrice, t, settings } = useStore();

  const { data: session } = useSession();

  const [isLoaded, setIsLoaded] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isProcessing, setIsProcessing] = useState(false);

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const [couponError, setCouponError] = useState("");

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  const [isCvvFocused, setIsCvvFocused] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    setIsLoaded(true);

    if (cartItems.length === 0) router.push("/cart");
  }, [cartItems, router]);

  const cartTotal = cartItems.reduce(
    (acc: number, item: any) => acc + item.fiyat * item.quantity,
    0
  );

  let discountAmount = 0;

  if (appliedCoupon) {
    discountAmount =
      appliedCoupon.discountType === "PERCENTAGE"
        ? (cartTotal * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue;

    if (discountAmount > cartTotal) discountAmount = cartTotal;
  }

  const FREE_SHIPPING_THRESHOLD = settings?.ucretsizKargoLimiti || 500;

  const BASE_SHIPPING_FEE = settings?.kargoUcreti || 49.9;

  const subtotalAfterDiscount = cartTotal - discountAmount;

  let shippingCost = BASE_SHIPPING_FEE;

  if (shippingMethod === "express") {
    shippingCost = BASE_SHIPPING_FEE * 2;
  } else if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) {
    shippingCost = 0;
  }

  const totalAmount = subtotalAfterDiscount + shippingCost;

  const getEstimatedDelivery = () => {
    const date = new Date();

    const daysToAdd = shippingMethod === "express" ? 1 : 3;

    date.setDate(date.getDate() + daysToAdd);

    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "cardNumber") {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

      const parts = v.match(/.{1,4}/g) || [];

      newValue = parts.join(" ");
    } else if (name === "cardExpiry") {
      const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

      if (v.length >= 2 && !v.includes("/")) newValue = `${v.substring(0, 2)}/${v.substring(2, 4)}`;
      else newValue = v;
    }

    const updatedFormData = { ...formData, [name]: newValue };

    setFormData(updatedFormData);

    try {
      checkoutSchema.pick({ [name]: true } as any).parse(updatedFormData);

      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: (err as z.ZodError).issues[0]?.message || "" }));
      }
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);

    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);

        setCouponCode("");

        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "Kupon uygulandı!",
          showConfirmButton: false,
          timer: 3000,
          background: "#18181b",
          color: "#fff",
          iconColor: "#ff007f",
        });
      } else setCouponError(data.error || "Geçersiz kupon kodu.");
    } catch (err) {
      setCouponError("Hata oluştu.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);

    const result = checkoutSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        if (err.path[0]) formattedErrors[err.path[0] as string] = err.message;
      });

      setErrors(formattedErrors);

      setIsProcessing(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Lüften formdaki hataları düzeltin.",
        showConfirmButton: false,
        timer: 3000,
        background: "#18181b",
        color: "#fff",
      });

      return;
    }

    if (
      paymentMethod === "card" &&
      (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv)
    ) {
      setIsProcessing(false);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Lüften kart bilgilerini eksiksiz girin.",
        showConfirmButton: false,
        timer: 3000,
        background: "#18181b",
        color: "#fff",
      });

      return;
    }

    try {
      const payload = {
        customer: formData.fullName,
        userId: (session?.user as any)?.id ? parseInt((session.user as any).id as string) : null,

        total: totalAmount,
        items: cartItems.map((i: any) => ({ productId: i.id, quantity: i.quantity, price: i.fiyat })),

        couponCode: appliedCoupon?.code || null,
        discountAmount,

        shippingMethod,
        paymentMethod,

        address: formData.address,
        city: formData.city,
        phone: formData.phone,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.error || "Sipariş oluşturulamadı.");
      }

      Swal.fire({
        title: "Siparişiniz Alındı!",
        text: "Siparişiniz başarıyla oluşturuldu.",
        icon: "success",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      }).then(() => {
        clearCart();
        router.push("/");
      });
    } catch (error: any) {
      Swal.fire({
        title: "Hata",
        text: error.message,
        icon: "error",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFastPayment = async (provider: "Apple Pay" | "Google Pay") => {
    setIsProcessing(true);

    setPaymentStatus(`${provider} başlatılıyor...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setPaymentStatus("Onay bekleniyor...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPaymentStatus("Sipariş oluşturuluyor...");

      const payload = {
        customer: formData.fullName || (session?.user as any)?.name || `${provider} Kullanıcısı`,
        userId: (session?.user as any)?.id ? parseInt((session.user as any).id as string) : null,

        total: totalAmount,
        items: cartItems.map((i: any) => ({ productId: i.id, quantity: i.quantity, price: i.fiyat })),

        couponCode: appliedCoupon?.code || null,
        discountAmount,

        paymentMethod: provider,
        shippingMethod,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.error || "Sipariş oluşturulamadı.");
      }

      setPaymentStatus("Başarılı!");

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${provider} ile ödeme başarılı!`,
        showConfirmButton: false,
        timer: 1500,
        background: "#18181b",
        color: "#fff",
        iconColor: "#d61c7b",
      });

      clearCart();

      router.push("/");
    } catch (error: any) {
      Swal.fire({
        title: "Hata",
        text: error.message,
        icon: "error",
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#ff007f",
      });
    } finally {
      setIsProcessing(false);

      setPaymentStatus(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-white/10 border-t-neon-pink rounded-full animate-spin"></div>

            <div className="absolute inset-2 border-4 border-white/10 border-b-holo-gold rounded-full animate-spin-slow"></div>
          </div>

          <div className="text-xl font-bold uppercase tracking-widest text-gray-500 animate-pulse">
            Ödeme Sayfası Hazırlanıyor...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* PROGRESS BAR */}

        <div className="w-full max-w-3xl mx-auto mb-12 hidden md:block">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-white/10 -z-10 rounded-full"></div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-gradient-to-r from-neon-pink to-holo-gold -z-10 rounded-full transition-all duration-500"></div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neon-pink text-foreground flex items-center justify-center font-bold shadow-lg shadow-neon-pink/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>

              <span className="text-[10px] uppercase tracking-widest font-bold text-foreground">
                Sepet
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-holo-gold text-foreground flex items-center justify-center font-bold shadow-lg shadow-holo-gold/30 animate-pulse">
                2
              </div>

              <span className="text-[10px] uppercase tracking-widest font-bold text-foreground">
                Teslimat & Ödeme
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 flex items-center justify-center font-bold">
                3
              </div>

              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Onay
              </span>
            </div>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}

          className="text-3xl md:text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary uppercase tracking-tighter text-center"
        >
          {t("checkout_title")}
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.5, delay: 0.2 }}

            className="w-full lg:w-2/3"
          >
            <form
              id="checkout-form"
              onSubmit={handlePayment}
              className="space-y-8 glass-panel p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

              <div className="relative z-10 space-y-10">
                {/* EXPRESS CHECKOUT */}

                <motion.div
                  whileHover={{ scale: 1.005 }}

                  className="glass-card p-6 rounded-[2rem] border border-white/20 dark:border-white/5 shadow-inner"
                >
                  <h3 className="text-xs font-bold text-foreground/60 mb-4 uppercase tracking-widest text-center">
                    Hızlı Ödeme
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleFastPayment("Apple Pay")}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-3 bg-black dark:bg-white text-foreground dark:text-black rounded-2xl py-4 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
                    >
                      {isProcessing && paymentStatus?.includes("Apple") ? (
                        <span className="text-xs tracking-widest uppercase opacity-80">
                          {paymentStatus}
                        </span>
                      ) : (
                        <>
                          <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                          </svg>

                          <span className="text-base tracking-wide">Pay</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFastPayment("Google Pay")}
                      disabled={isProcessing}
                      className="flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-foreground rounded-2xl py-4 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing && paymentStatus?.includes("Google") ? (
                        <span className="text-xs tracking-widest uppercase opacity-80">
                          {paymentStatus}
                        </span>
                      ) : (
                        <>
                          <svg viewBox="0 0 48 48" className="w-4 h-4">
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                          </svg>

                          <span className="text-base tracking-wide">Google Pay</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative mt-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-white/10"></div>
                    </div>

                    <span className="relative glass-card px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest backdrop-blur-md">
                      Veya Klasik Yöntemle
                    </span>
                  </div>
                </motion.div>

                {/* DELIVERY ADDRESS */}

                <motion.div className="space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-widest border-b border-glass-border pb-4">
                    <Truck className="w-5 h-5 text-neon-pink" />
                    Teslimat Bilgileri
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {["fullName", "email", "phone", "city"].map((field) => (
                      <div key={field} className="relative group/input">
                        <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-[0.2em] group-focus-within/input:text-primary transition-colors">
                          {t(
                            field === "fullName"
                              ? "full_name"
                              : field === "city"
                                ? "district"
                                : field
                          )}
                        </label>

                        <input
                          required
                          type={field === "email" ? "email" : "text"}
                          name={field}
                          value={(formData as any)[field]}
                          onChange={handleInputChange}
                          className={`w-full glass-panel border ${errors[field] ? "border-red-500" : "border-glass-border"} text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm shadow-inner font-semibold`}
                        />

                        <AnimatePresence>
                          {errors[field] && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-red-500 text-[10px] mt-1 ml-1 font-bold"
                            >
                              {errors[field]}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    <div className="md:col-span-2 relative group/input">
                      <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-[0.2em] group-focus-within/input:text-neon-pink transition-colors">
                        {t("address")}
                      </label>

                      <textarea
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full glass-panel border ${errors.address ? "border-red-500" : "border-glass-border"} text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent transition-all resize-none backdrop-blur-sm shadow-inner font-semibold`}
                      ></textarea>
                    </div>
                  </div>
                </motion.div>

                {/* SHIPPING METHOD */}

                <motion.div className="space-y-4">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-widest border-b border-glass-border pb-4">
                    Kargo Seçenekleri
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      className={`cursor-pointer flex flex-col p-4 rounded-2xl border-2 transition-all ${shippingMethod === "standard" ? "border-neon-pink bg-neon-pink/5" : "border-glass-border hover:border-neon-pink/50"}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold flex items-center gap-2">
                          <Truck className="w-4 h-4" /> Standart Kargo
                        </span>

                        <input
                          type="radio"
                          name="shippingMethod"
                          value="standard"
                          checked={shippingMethod === "standard"}
                          onChange={() => setShippingMethod("standard")}
                          className="text-neon-pink focus:ring-neon-pink"
                        />
                      </div>

                      <span className="text-xs text-foreground/60 mb-2">
                        2-4 iş günü içinde teslimat
                      </span>

                      <span className="font-black text-neon-pink mt-auto">
                        {subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD
                          ? "Ücretsiz"
                          : formatPrice(BASE_SHIPPING_FEE)}
                      </span>
                    </label>

                    <label
                      className={`cursor-pointer flex flex-col p-4 rounded-2xl border-2 transition-all ${shippingMethod === "express" ? "border-holo-gold bg-holo-gold/5" : "border-glass-border hover:border-holo-gold/50"}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold flex items-center gap-2 text-holo-gold">
                          <Truck className="w-4 h-4" /> Hızlı Kargo
                        </span>

                        <input
                          type="radio"
                          name="shippingMethod"
                          value="express"
                          checked={shippingMethod === "express"}
                          onChange={() => setShippingMethod("express")}
                          className="text-holo-gold focus:ring-holo-gold"
                        />
                      </div>

                      <span className="text-xs text-foreground/60 mb-2">
                        Ertesi gün teslimat avantajı
                      </span>

                      <span className="font-black text-holo-gold mt-auto">
                        {formatPrice(BASE_SHIPPING_FEE * 2)}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-foreground/60 bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-xl">
                    <Calendar className="w-4 h-4 text-neon-pink" />

                    <span>
                      Tahmini Teslimat:{" "}
                      <span className="text-foreground">
                        {getEstimatedDelivery()}
                      </span>
                    </span>
                  </div>
                </motion.div>

                {/* PAYMENT METHOD */}

                <motion.div className="space-y-6">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-widest border-b border-glass-border pb-4">
                    <CreditCard className="w-5 h-5 text-holo-gold" />
                    Ödeme Yöntemi
                  </h2>

                  <div className="flex gap-4">
                    <label
                      className={`flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "card" ? "border-holo-gold bg-holo-gold/5 text-holo-gold" : "border-glass-border text-foreground/60"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="hidden"
                      />
                      <CreditCard className="w-4 h-4" />{" "}
                      <span className="font-bold text-sm">Kredi Kartı</span>
                    </label>

                    <label
                      className={`flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5 text-primary" : "border-glass-border text-foreground/60"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="hidden"
                      />
                      <Banknote className="w-4 h-4" />{" "}
                      <span className="font-bold text-sm">Kapıda Ödeme</span>
                    </label>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}

                        animate={{ opacity: 1, height: "auto" }}

                        exit={{ opacity: 0, height: 0 }}

                        className="overflow-hidden"
                      >
                        {/* Modern Card Visual */}

                        <div className="max-w-[360px] mx-auto mb-8 perspective-1000 group">
                          <motion.div
                            animate={{ rotateY: isCvvFocused ? 180 : 0 }}

                            transition={{ duration: 0.6, type: "spring" }}

                            className="w-full h-48 relative preserve-3d"
                          >
                            {/* Card Front */}

                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-gray-900 via-zinc-800 to-black rounded-2xl p-6 shadow-2xl border border-white/10 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded opacity-90 shadow-sm flex items-center justify-center">
                                  <div className="w-6 h-4 border border-yellow-200/50 rounded-sm"></div>
                                </div>

                                <div className="flex -space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-screen"></div>

                                  <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-screen"></div>
                                </div>
                              </div>

                              <div className="text-foreground text-xl tracking-[0.15em] font-mono drop-shadow-md">
                                {formData.cardNumber ||
                                  "•••• •••• •••• ••••"}
                              </div>

                              <div className="flex justify-between text-gray-300">
                                <div className="flex flex-col">
                                  <span className="text-[8px] uppercase tracking-widest opacity-70 mb-0.5">
                                    Card Holder
                                  </span>

                                  <span className="uppercase tracking-widest text-xs font-bold truncate w-32">
                                    {formData.fullName || "AD SOYAD"}
                                  </span>
                                </div>

                                <div className="flex flex-col text-right">
                                  <span className="text-[8px] uppercase tracking-widest opacity-70 mb-0.5">
                                    Expires
                                  </span>

                                  <span className="font-mono font-bold tracking-widest text-xs">
                                    {formData.cardExpiry || "MM/YY"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Card Back */}

                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-gray-900 via-zinc-800 to-black rounded-2xl shadow-2xl border border-white/10 rotate-y-180 flex flex-col">
                              <div className="w-full h-10 bg-black mt-4"></div>

                              <div className="px-6 mt-4">
                                <div className="flex justify-end bg-gray-200 h-8 items-center px-3 rounded text-black font-mono font-bold text-sm">
                                  {formData.cardCvv || "***"}
                                </div>

                                <p className="text-[8px] text-gray-500 mt-2 pr-12">
                                  Bu kart sadece güvenli alışveriş içindir. Arka yüzdeki
                                  güvenlik kodu (CVV) ile işlem yapabilirsiniz.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 relative group/input">
                            <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-[0.2em] group-focus-within/input:text-holo-gold transition-colors">
                              Kart Numarası
                            </label>

                            <input
                              required={paymentMethod === "card"}
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              onFocus={() => setIsCvvFocused(false)}
                              maxLength={19}
                              className={`w-full glass-panel border ${errors.cardNumber ? "border-red-500" : "border-glass-border"} text-foreground rounded-xl px-4 py-3 font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-holo-gold focus:outline-none transition-all shadow-inner`}
                              placeholder="0000 0000 0000 0000"
                            />
                          </div>

                          <div className="relative group/input">
                            <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-[0.2em] group-focus-within/input:text-holo-gold transition-colors">
                              SKT
                            </label>

                            <input
                              required={paymentMethod === "card"}
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              onFocus={() => setIsCvvFocused(false)}
                              maxLength={5}
                              className={`w-full glass-panel border ${errors.cardExpiry ? "border-red-500" : "border-glass-border"} text-foreground rounded-xl px-4 py-3 font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-holo-gold focus:outline-none transition-all shadow-inner text-center`}
                              placeholder="MM/YY"
                            />
                          </div>

                          <div className="relative group/input">
                            <label className="block text-[10px] font-black text-foreground/60 mb-1.5 uppercase tracking-[0.2em] group-focus-within/input:text-holo-gold transition-colors">
                              CVV
                            </label>

                            <input
                              required={paymentMethod === "card"}
                              type="text"
                              name="cardCvv"
                              value={formData.cardCvv}
                              onChange={handleInputChange}
                              onFocus={() => setIsCvvFocused(true)}
                              onBlur={() => setIsCvvFocused(false)}
                              maxLength={3}
                              className={`w-full glass-panel border ${errors.cardCvv ? "border-red-500" : "border-glass-border"} text-foreground rounded-xl px-4 py-3 font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-holo-gold focus:outline-none transition-all shadow-inner text-center`}
                              placeholder="***"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}

                whileTap={{ scale: 0.95 }}

                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-foreground py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-xl hover:shadow-neon-pink/40 transition-all duration-300 flex items-center justify-center gap-4 mt-6"
              >
                {isProcessing ? (
                  "İşleniyor..."
                ) : (
                  <>
                    ÖDEMEYİ TAMAMLA
                    <span className="opacity-50 font-normal">|</span>
                    {formatPrice(totalAmount)}
                    <svg
                      className="w-5 h-5 ml-2 animate-bounce-x"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </>
                )}
              </motion.button>

              {/* Trust Badges */}

              <div className="flex justify-center items-center gap-6 mt-6 pt-6 border-t border-glass-border opacity-70">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-foreground/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  256-bit SSL Güvenliği
                </div>

                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-foreground/70">
                  <RotateCcw className="w-4 h-4 text-blue-500" />
                  Kolay İade
                </div>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.5, delay: 0.4 }}

            className="w-full lg:w-1/3"
          >
            <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 lg:sticky lg:top-32">
              {/* Order Summary Accordion on Mobile (Hidden implementation here, visually simplified) */}

              <h2 className="text-lg font-black text-foreground mb-6 uppercase tracking-[0.2em] border-b border-glass-border pb-4">
                Sipariş Özeti
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item: any, i: number) => {
                  const images = item.gorsel ? item.gorsel.split(",") : [];

                  return (
                    <motion.div
                      key={i}

                      whileHover={{ scale: 1.02 }}

                      className="flex gap-4 items-center group glass-card p-2.5 rounded-xl border border-white/20 dark:border-white/5 shadow-inner transition-all duration-300"
                    >
                      <div className="relative w-16 h-20 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={getValidImageUrl(images[0])}
                          alt={item.ad}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="64px"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-xs font-black text-foreground line-clamp-2 mb-1 group-hover:text-neon-pink transition-colors">
                          {t(item.ad)}
                        </h4>

                        <div className="flex gap-1.5 text-[9px] uppercase font-bold text-foreground/60 mb-1.5">
                          <span className="bg-white/80 dark:bg-zinc-900/80 px-1.5 py-0.5 rounded-md">
                            {item.beden}
                          </span>

                          <span className="bg-white/80 dark:bg-zinc-900/80 px-1.5 py-0.5 rounded-md">
                            {item.renk}
                          </span>
                        </div>

                        <p className="text-xs font-black text-foreground">
                          {item.quantity} <span className="text-gray-400 mx-1">x</span>{" "}
                          {formatPrice(item.fiyat)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kupon Kodu"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 glass-panel border border-glass-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-neon-pink outline-none uppercase text-xs font-bold tracking-widest text-foreground shadow-inner"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                      className="bg-gray-900 dark:bg-white text-foreground dark:text-black px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neon-pink dark:hover:bg-neon-pink hover:text-foreground dark:hover:text-foreground transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Uygula
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}

                    animate={{ opacity: 1, scale: 1 }}

                    className="bg-gradient-to-r from-neon-pink/10 to-holo-gold/10 border border-neon-pink/20 rounded-xl p-3 flex justify-between items-center backdrop-blur-sm"
                  >
                    <div>
                      <p className="text-neon-pink font-black text-xs tracking-widest">
                        {appliedCoupon.code}
                      </p>

                      <p className="text-foreground/60 text-[10px] font-bold mt-0.5">
                        İndirim uygulandı
                      </p>
                    </div>

                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-foreground transition-all duration-300"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </motion.div>
                )}

                {couponError && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{couponError}</p>
                )}
              </div>

              <div className="space-y-3 text-xs font-bold text-gray-600 dark:text-gray-300 mb-6 glass-card p-5 rounded-[1.5rem] border border-white/20 dark:border-white/5 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-widest">{t("subtotal")}</span>
                  <span className="text-foreground text-sm">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="uppercase tracking-widest">
                    {t("shipping")} ({shippingMethod === "express" ? "Hızlı" : "Standart"})
                  </span>
                  <span
                    className={
                      shippingCost === 0
                        ? "text-pink-500 uppercase tracking-widest text-[10px] bg-pink-500/10 px-2 py-1 rounded-md"
                        : "text-foreground text-sm"
                    }
                  >
                    {shippingCost === 0 ? t("free") : formatPrice(shippingCost)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-neon-pink pt-3 border-t border-glass-border mt-3">
                    <span className="uppercase tracking-widest">İndirim</span>
                    <span className="text-sm">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 pt-4 border-t border-glass-border">
                <span className="text-foreground/60 font-black uppercase tracking-[0.3em] text-[10px]">
                  Toplam
                </span>

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold font-black text-4xl tracking-tighter">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
