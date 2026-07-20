"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStore } from "../../context/StoreContext";
import { getValidImageUrl } from "../../utils/imageHelper";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Swal from "sweetalert2";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, isLoaded, formatPrice, t } =
    useStore();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleRemove = (item: any) => {
    Swal.fire({
      title: t("Emin misiniz?"),
      text: t("Bu ürünü sepetten silmek üzeresiniz!"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff007f",
      cancelButtonColor: "#333",
      confirmButtonText: t("Evet, Sil"),
      cancelButtonText: t("İptal"),
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(item.id, item.beden, item.renk);
        Swal.fire({
          title: t("Silindi!"),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleClear = () => {
    Swal.fire({
      title: t("Sepeti boşaltmak istediğinize emin misiniz?"),
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#333",
      confirmButtonText: t("Evet, Boşalt"),
      cancelButtonText: t("İptal"),
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          title: t("Sepet boşaltıldı!"),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const totalAmount = cartItems.reduce(
    (acc: number, item: any) => acc + item.fiyat * item.quantity,
    0
  );

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center mb-16" data-aos="fade-down">
          <div className="w-24 h-24 bg-gradient-to-tr from-neon-pink/20 to-holo-gold/20 rounded-full blur-[40px] absolute -top-10"></div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold uppercase tracking-tighter text-center relative z-10">
            {t("my_cart")}
          </h1>
          {cartItems.length > 0 && (
            <p className="text-foreground/60 mt-4 font-bold tracking-widest uppercase text-sm">
              {cartItems.length} Ürün
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20" data-aos="zoom-in">
            <div className="w-40 h-40 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-full shadow-2xl flex items-center justify-center mb-10 border border-white/50 dark:border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-pink/20 to-holo-gold/20 animate-pulse"></div>
              <svg
                className="w-16 h-16 text-neon-pink relative z-10 group-hover:scale-125 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-wider">
              {t("cart_empty")}
            </h2>
            <p className="text-foreground/60 mb-10 max-w-md text-center">
              {t("no_products_found_desc")}
            </p>
            <Link
              href="/search"
              className="bg-gradient-to-r from-neon-pink to-holo-gold text-foreground px-12 py-5 rounded-full uppercase tracking-[0.2em] text-sm font-black shadow-xl shadow-neon-pink/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink/50 active:scale-95"
            >
              {t("explore_collection")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-2/3 space-y-6">
              {cartItems.map((item: any, index: number) => {
                const images = item.gorsel ? item.gorsel.split(",") : [];
                return (
                  <div
                    key={`${item.id}-${item.beden}-${item.renk}-${index}`}
                    data-aos="fade-right"
                    data-aos-delay={index * 100}
                    className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-white/10 flex flex-col sm:flex-row gap-6 items-center group hover:shadow-2xl hover:shadow-neon-pink/20 transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

                    <Link
                      href={`/urundetay/${item.id}`}
                      className="relative w-36 h-48 rounded-2xl overflow-hidden shrink-0 shadow-inner z-10"
                    >
                      <Image
                        src={getValidImageUrl(images[0])}
                        alt={item.ad}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="144px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    <div className="flex-1 flex flex-col sm:flex-row justify-between w-full relative z-10">
                      <div className="flex flex-col justify-center gap-3">
                        <Link
                          href={`/urundetay/${item.id}`}
                          className="text-xl font-black text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-pink group-hover:to-holo-gold transition-all duration-300 line-clamp-2"
                        >
                          {t(item.ad)}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-foreground/80 px-4 py-1.5 rounded-xl text-xs font-black tracking-wider border border-gray-100 dark:border-zinc-700 shadow-sm uppercase">
                            Beden: {item.beden}
                          </span>
                          <span className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-foreground/80 px-4 py-1.5 rounded-xl text-xs font-black tracking-wider border border-gray-100 dark:border-zinc-700 shadow-sm uppercase">
                            Renk: {t(item.renk)}
                          </span>
                        </div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mt-2">
                          {formatPrice(item.fiyat * item.quantity)}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-6 mt-6 sm:mt-0">
                        <div className="flex items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-full border border-glass-border p-1.5 shadow-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.beden, item.renk, item.quantity - 1)
                            }
                            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-neon-pink transition-all font-black active:scale-90 text-lg"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-black text-foreground text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.beden, item.renk, item.quantity + 1)
                            }
                            className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/70 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-neon-pink transition-all font-black active:scale-90 text-lg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item)}
                          className="w-12 h-12 rounded-full bg-red-50/80 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-foreground transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-500/30 active:scale-90 group/btn"
                          title={t("remove")}
                        >
                          <svg
                            className="w-5 h-5 group-hover/btn:rotate-12 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end mt-8" data-aos="fade-up">
                <button
                  onClick={handleClear}
                  className="text-xs font-black tracking-widest uppercase text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 px-6 py-3 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 group"
                >
                  <svg
                    className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                  Sepeti Temizle
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/3" data-aos="fade-left" data-aos-delay="200">
              <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 sticky top-32 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-holo-gold/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                <h3 className="text-2xl font-black text-foreground mb-8 uppercase tracking-[0.2em] relative z-10 flex items-center gap-3">
                  Sipariş Özeti
                </h3>

                <div className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300 relative z-10 mb-8">
                  <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
                    <span className="uppercase tracking-widest">{t("subtotal")}</span>
                    <span className="text-foreground text-lg">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
                    <span className="uppercase tracking-widest">{t("shipping")}</span>
                    <span className="text-pink-500 uppercase tracking-widest">{t("free")}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent my-8 relative z-10"></div>

                <div className="flex flex-col gap-2 mb-10 relative z-10">
                  <span className="text-foreground/60 font-black text-xs uppercase tracking-[0.3em]">
                    {t("total")}
                  </span>
                  <span className="text-foreground font-black text-5xl text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold tracking-tighter">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <button
                  onClick={() => router.push(session ? "/checkout" : "/login")}
                  className="w-full btn-premium py-6 rounded-2xl font-black text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-4 group/btn relative z-10"
                >
                  {t("checkout")}
                  <svg
                    className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
