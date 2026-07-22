"use client";
import { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { useStore } from "../../../context/StoreContext";
import FavoriteButton from "../../../components/FavoriteButton";
import dynamic from "next/dynamic";
import Link from "next/link";
const QuickViewModal = dynamic(() => import("../../../components/QuickViewModal"), { ssr: false });
import { getValidImageUrl } from "../../../utils/imageHelper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
export default function ProductDetailsClient({
  product,
  relatedProducts = [],
  initialReviews = [],
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart, formatPrice, t } = useStore();
  const [beden, setBeden] = useState("");
  const [renk, setRenk] = useState("");
  const [activeTab, setActiveTab] = useState("detay");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length
      : 0;

  const bedenList = product.beden ? product.beden.split(",").map((s) => s.trim()) : ["Standart"];
  const hasColors = product.colors && product.colors.length > 0;
  const renkList = hasColors
    ? product.colors.map((c) => c.renkAdi)
    : product.renk
      ? product.renk.split(",").map((s) => s.trim())
      : ["Standart"];

  const selectedColorObj = hasColors
    ? product.colors.find((c) => c.renkAdi === (renk || renkList[0]))
    : null;
  const activeImageUrl =
    selectedColorObj?.gorselUrl || product.resim || product.gorsel?.split(",")[0];

  // Prepare images for Swiper
  let swiperImages = [];
  if (product.gorsel) {
    swiperImages = product.gorsel
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  } else if (product.resim) {
    swiperImages = [product.resim];
  }

  if (selectedColorObj && selectedColorObj.gorselUrl) {
    // If a color is selected, put its image first
    swiperImages = [
      selectedColorObj.gorselUrl,
      ...swiperImages.filter((img) => img !== selectedColorObj.gorselUrl),
    ];
  }

  // Ensure there's at least one image
  if (swiperImages.length === 0) swiperImages = ["/images/placeholder.jpg"];
  const handleAddToCart = () => {
    if (!beden || !renk) {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        icon: "warning",
        title: t("review_warning_selection_title"),
        text: t("review_warning_selection_desc"),
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#be185d",
        customClass: {
          popup: "border border-secondary backdrop-blur-md rounded-xl",
        },
      });
      return;
    }

    addToCart(product, beden, renk);
    Swal.fire({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      icon: "success",
      title: t("cart_added_title"),
      text: t("cart_added_desc", { name: t(product.ad) }),
      background: "rgba(10, 10, 10, 0.9)",
      color: "#fff",
      iconColor: "#ff007f",
      customClass: {
        popup: "border border-primary backdrop-blur-md rounded-xl",
      },
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId: session.user.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setReviews([
        { ...data.review, user: { name: session.user.name, email: session.user.email } },
        ...reviews,
      ]);
      setComment("");
      setRating(5);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        icon: "success",
        title: t("review_success_title"),
        text: t("review_success_desc"),
        background: "rgba(10, 10, 10, 0.9)",
        color: "#fff",
        iconColor: "#ff007f",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: err.message,
        background: "#1a1a1a",
        color: "#fff",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Breadcrumb */}
        <nav
          className="flex text-gray-500 text-xs tracking-widest uppercase mb-8"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                {t("home")}
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link
                  href={`/search?q=${product.kategori || ""}`}
                  className="hover:text-primary transition-colors"
                >
                  {t(product.kategori) || t("collection")}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center text-foreground">
                <span className="mx-2 text-gray-500">/</span>
                <span className="truncate max-w-[200px] sm:max-w-xs">{t(product.ad)}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Image Section - Stacked on Desktop, Swiper on Mobile */}
          <div
            className="w-full lg:w-[55%] relative group"
            data-aos="fade-right"
            suppressHydrationWarning
          >
            {/* Desktop & Mobile Swiper Gallery */}
            <div className="relative glass-panel p-2 clip-angled">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-full aspect-[3/4] clip-angled overflow-hidden group-hover:shadow-[0_0_30px_rgba(255,0,127,0.3)] transition-shadow">
                <Swiper
                  modules={[Navigation, Pagination, EffectFade, Autoplay]}
                  effect="fade"
                  navigation
                  pagination={{ clickable: true, dynamicBullets: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: true }}
                  className="w-full h-full"
                >
                  {swiperImages.map((imgSrc, idx) => (
                    <SwiperSlide key={idx}>
                      <Image
                        src={getValidImageUrl(imgSrc)}
                        alt={`${product.ad} - Görsel ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* Holographic floating element */}
            <div className="absolute -left-8 top-20 w-16 h-16 border border-secondary opacity-30 clip-hexa float-fx hidden md:block"></div>
          </div>

          {/* Details Section - Sticky on Desktop */}
          <div
            className="w-full lg:w-[45%] lg:sticky lg:top-32 glass-panel p-6 md:p-9 clip-angled self-start"
            data-aos="fade-left"
            suppressHydrationWarning
          >
            <span className="text-primary tracking-[0.2em] text-xs font-bold uppercase mb-4 block">
              {product.etiket ? t(product.etiket) : t("new_season")}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 leading-tight">
              {t(product.ad)}
            </h1>

            {/* Reviews Summary */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-secondary text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= avgRating ? "text-secondary" : "text-gray-600"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {t("reviews_count", { count: String(reviews.length) })}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-glow-secondary mb-6">{formatPrice(product.fiyat)}</h2>

            <div className="h-px w-full bg-white/10 mb-6"></div>

            {/* Select Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  {t("size")}
                </label>
                <div className="relative">
                  <select
                    value={beden}
                    onChange={(e) => setBeden(e.target.value)}
                    aria-label={t("select_size")}
                    className="block appearance-none w-full bg-background border border-glass-border text-foreground py-4 px-4 pr-8 rounded-none leading-tight focus:outline-none focus:border-primary transition-colors touch-manipulation"
                  >
                    <option value="" disabled>
                      {t("select_size")}
                    </option>
                    {bedenList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-3 uppercase tracking-wider">
                  {t("color")}
                </label>
                <div className="flex flex-wrap gap-3">
                  {renkList.map((r) => {
                    const isSelected = renk === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRenk(r)}
                        className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 clip-angled border touch-manipulation ${
                          isSelected
                            ? "bg-primary text-foreground border-primary shadow-[0_0_15px_rgba(255,0,127,0.4)]"
                            : "bg-white/50 dark:bg-black/50 text-gray-700 dark:text-gray-400 border-glass-border hover:border-secondary hover:text-gray-900 dark:hover:text-foreground"
                        }`}
                        aria-label={t("select_color")}
                      >
                        {t(r) || r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-transparent border border-primary text-primary hover:bg-primary hover:text-foreground py-4 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm shadow-subtle hover:shadow-[0_0_20px_hsla(var(--primary),0.5)] group relative overflow-hidden"
              >
                <span className="relative z-10">{t("add_to_cart")}</span>
                <div className="absolute inset-0 bg-primary transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
              </button>
              <FavoriteButton
                product={product}
                className="w-16 flex items-center justify-center border border-glass-border hover:border-primary text-foreground/70 hover:text-primary transition-all duration-300 clip-angled hover:shadow-[0_0_15px_hsla(var(--primary),0.3)]"
              />
            </div>

            <div className="h-px w-full bg-white/10 mb-6"></div>

            {/* ACCORDION TABS */}
            <div className="space-y-4">
              {/* Detay Tab */}
              <div className="border border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-black/30">
                <button
                  onClick={() => setActiveTab(activeTab === "detay" ? "" : "detay")}
                  className="w-full flex justify-between items-center p-4 text-foreground hover:text-primary transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  <span>{t("product_specs")}</span>
                  <span>{activeTab === "detay" ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeTab === "detay" ? "max-h-40 p-4 pt-0" : "max-h-0 px-4"}`}
                >
                  <p className="text-foreground/70 font-light text-sm leading-relaxed">
                    {t(product.ad)} - {t("quick_view_desc")}
                  </p>
                </div>
              </div>

              {/* Kumaş Tab */}
              <div className="border border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-black/30">
                <button
                  onClick={() => setActiveTab(activeTab === "kumas" ? "" : "kumas")}
                  className="w-full flex justify-between items-center p-4 text-foreground hover:text-primary transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  <span>
                    {t("fabric")} & {t("washing")}
                  </span>
                  <span>{activeTab === "kumas" ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeTab === "kumas" ? "max-h-40 p-4 pt-0" : "max-h-0 px-4"}`}
                >
                  <ul className="text-foreground/70 font-light text-sm leading-relaxed list-disc list-inside">
                    <li>{t("fabric_type")}</li>
                    <li>{t("washing_instruction")}</li>
                  </ul>
                </div>
              </div>

              {/* Teslimat Tab */}
              <div className="border border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-black/30">
                <button
                  onClick={() => setActiveTab(activeTab === "teslimat" ? "" : "teslimat")}
                  className="w-full flex justify-between items-center p-4 text-foreground hover:text-primary transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  <span>{t("fast_shipping")}</span>
                  <span>{activeTab === "teslimat" ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeTab === "teslimat" ? "max-h-40 p-4 pt-0" : "max-h-0 px-4"}`}
                >
                  <p className="text-foreground/70 font-light text-sm leading-relaxed mb-2">
                    📦 {t("fast_shipping_desc")}
                  </p>
                  <p className="text-foreground/70 font-light text-sm leading-relaxed">
                    🔄 {t("return_policy")}
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> {t("fast_shipping")}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div> {t("installment")}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/30 rounded-full"></div>{" "}
                {t("secure_shopping")}
              </li>
            </ul>
          </div>
        </div>

        {/* Müşteri Yorumları Section */}
        <div className="mt-16 border-t border-glass-border pt-12 relative">
          <h3 className="text-xl font-black text-foreground uppercase tracking-widest mb-8 text-center">
            {t("reviews_title")}
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Add Review Form */}
            <div className="glass-panel p-6 clip-angled bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/10 backdrop-blur-md">
              <h4 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">
                {t("write_review")}
              </h4>
              {session ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 uppercase">
                      {t("your_rating")}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          aria-label={`${star} Yıldız`}
                          className={`text-2xl ${rating >= star ? "text-secondary" : "text-gray-600"} hover:text-secondary transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 uppercase">
                      {t("your_comment")}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      aria-label={t("your_comment")}
                      className="w-full bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-white/10 text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors h-32 resize-none"
                      placeholder={t("comment_placeholder")}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-primary text-foreground font-bold py-3 uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-foreground dark:hover:text-black transition-colors clip-angled disabled:opacity-50"
                  >
                    {isSubmittingReview ? t("sending") : t("send_comment")}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-foreground/70 mb-4">{t("login_required_review")}</p>
                  <Link
                    href="/login"
                    className="inline-block bg-transparent border border-primary text-primary hover:bg-primary hover:text-foreground py-3 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm"
                  >
                    {t("login")}
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-glass-border pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex flex-col">
                          <span className="text-foreground font-bold">
                            {review.user?.name || review.user?.email?.split("@")[0]}
                          </span>
                          <span className="text-gray-500 text-xs mt-0.5">{review.user?.email}</span>
                        </div>
                        <div className="flex text-secondary text-sm mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= review.rating ? "text-secondary" : "text-gray-600"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-foreground/70 text-sm mt-2">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-foreground/60 italic">{t("no_reviews_yet")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Benzer Ürünler (Related Products) */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-glass-border pt-12 relative">
            <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-secondary opacity-[0.02] rounded-full blur-[100px] pointer-events-none"></div>

            <h3 className="text-xl font-black text-foreground uppercase tracking-widest mb-8 text-center">
              {t("similar_products")}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <Link
                  href={`/urundetay/${rp.id}`}
                  key={rp.id}
                  className="group relative block glass-card p-3 clip-angled transition-all hover:border-primary/40 overflow-hidden"
                >
                  <div className="relative h-48 md:h-60 w-full overflow-hidden clip-angled mb-3 transform-gpu">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <Image
                      src={getValidImageUrl(rp.resim || rp.gorsel?.split(",")[0])}
                      alt={rp.ad}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {rp.etiket && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-background/90 backdrop-blur-md text-foreground px-3 py-1 border border-glass-border shadow-sm">
                          {t(rp.etiket)}
                        </span>
                      </div>
                    )}

                    {/* Quick View Button - appears on hover */}
                    <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-30">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigating to product details page
                          setQuickViewProduct(rp);
                        }}
                        className="text-xs uppercase tracking-widest font-bold text-foreground hover:text-foreground transition-colors mt-1 bg-background/70 hover:bg-primary px-6 py-3 rounded-full backdrop-blur-md touch-manipulation shadow-lg border border-glass-border w-full hover:shadow-[0_0_15px_hsla(var(--primary),0.5)]"
                      >
                        {t("quick_view")}
                      </button>
                    </div>
                  </div>
                  <div className="p-2 z-20 relative">
                    <p className="text-foreground/50 text-[10px] uppercase tracking-widest mb-1">
                      {t(rp.kategori)}
                    </p>
                    <h4 className="text-foreground font-bold text-sm truncate mb-2 group-hover:text-primary transition-colors">
                      {t(rp.ad)}
                    </h4>
                    <p className="text-primary font-bold text-sm">{formatPrice(rp.fiyat)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY ADD TO CART BAR (Mobile mostly, but useful everywhere on scroll down) */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-black/10 dark:border-white/10 py-4 px-4 flex items-center justify-between md:hidden translate-y-0 transition-transform duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
            <Image
              src={getValidImageUrl(activeImageUrl)}
              alt={product.ad}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-foreground font-bold text-sm truncate">{product.ad}</h4>
            <span className="text-primary text-sm font-bold">{formatPrice(product.fiyat)}</span>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-primary text-foreground uppercase tracking-widest font-bold px-6 py-4 text-xs clip-angled hover:bg-black dark:hover:bg-white hover:text-foreground dark:hover:text-black transition-colors touch-manipulation shadow-[0_0_15px_rgba(255,0,127,0.4)] flex-shrink-0"
        >
          {t("add_to_cart")}
        </button>
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
