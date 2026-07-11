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
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  const bedenList = product.beden ? product.beden.split(",").map((s) => s.trim()) : ["Standart"];
  const renkList = product.renk ? product.renk.split(",").map((s) => s.trim()) : ["Standart"];

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
        iconColor: "#ffd700",
        customClass: {
          popup: "border border-holo-gold backdrop-blur-md rounded-xl",
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
        popup: "border border-neon-pink backdrop-blur-md rounded-xl",
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
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-neon-pink opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-holo-gold opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Breadcrumb */}
        <nav
          className="flex text-gray-500 text-xs tracking-widest uppercase mb-8"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-neon-pink transition-colors">
                {t("home")}
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link
                  href={`/search?q=${product.kategori || ""}`}
                  className="hover:text-neon-pink transition-colors"
                >
                  {t(product.kategori) || t("collection")}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center text-white">
                <span className="mx-2 text-gray-500">/</span>
                <span className="truncate max-w-[200px] sm:max-w-xs">{t(product.ad)}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Image Section - Floating and Clipped */}
          <div className="w-full lg:w-1/2 relative group" data-aos="fade-right" suppressHydrationWarning>
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-holo-gold rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-panel p-2 clip-angled">
              <div className="relative w-full h-[600px] md:h-[800px] clip-angled overflow-hidden">
                <Image
                  src={getValidImageUrl(product.resim || product.gorsel?.split(',')[0])}
                  alt={product.ad}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>

            {/* Holographic floating element */}
            <div className="absolute -left-8 top-20 w-16 h-16 border border-holo-gold opacity-30 clip-hexa float-fx hidden md:block"></div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 glass-panel p-8 md:p-12 clip-angled" data-aos="fade-left" suppressHydrationWarning>
            <span className="text-neon-pink tracking-[0.2em] text-xs font-bold uppercase mb-4 block">
              {product.etiket ? t(product.etiket) : t("new_season")}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
              {t(product.ad)}
            </h1>

            {/* Reviews Summary */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-holo-gold text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= avgRating ? "text-holo-gold" : "text-gray-600"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {t("reviews_count", { count: reviews.length })}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-glow-gold mb-8">{formatPrice(product.fiyat)}</h2>

            <div className="h-px w-full bg-white/10 mb-8"></div>

            {/* Select Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  {t("size")}
                </label>
                <div className="relative">
                  <select
                    value={beden}
                    onChange={(e) => setBeden(e.target.value)}
                    aria-label={t("select_size")}
                    className="block appearance-none w-full bg-black border border-gray-700 text-white py-3 px-4 pr-8 rounded-none leading-tight focus:outline-none focus:border-neon-pink transition-colors"
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
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  {t("color")}
                </label>
                <div className="relative">
                  <select
                    value={renk}
                    onChange={(e) => setRenk(e.target.value)}
                    aria-label={t("select_color")}
                    className="block appearance-none w-full bg-black border border-gray-700 text-white py-3 px-4 pr-8 rounded-none leading-tight focus:outline-none focus:border-holo-gold transition-colors"
                  >
                    <option value="" disabled>
                      {t("select_color")}
                    </option>
                    {renkList.map((r) => (
                      <option key={r} value={r}>
                        {t(r) || r}
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
            </div>

            <div className="flex gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-transparent border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white py-4 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm"
              >
                {t("add_to_cart")}
              </button>
              <FavoriteButton
                product={product}
                className="w-16 flex items-center justify-center border border-gray-700 hover:border-neon-pink transition-all duration-300 clip-angled"
              />
            </div>

            <div className="h-px w-full bg-white/10 mb-8"></div>

            {/* ACCORDION TABS */}
            <div className="space-y-4">
              {/* Detay Tab */}
              <div className="border border-gray-800 bg-black/30">
                <button
                  onClick={() => setActiveTab(activeTab === "detay" ? "" : "detay")}
                  className="w-full flex justify-between items-center p-4 text-white hover:text-neon-pink transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  <span>{t("product_specs")}</span>
                  <span>{activeTab === "detay" ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeTab === "detay" ? "max-h-40 p-4 pt-0" : "max-h-0 px-4"}`}
                >
                  <p className="text-gray-400 font-light text-sm leading-relaxed">
                    {t(product.ad)} - {t("quick_view_desc")}
                  </p>
                </div>
              </div>

              {/* Kumaş Tab */}
              <div className="border border-gray-800 bg-black/30">
                <button
                  onClick={() => setActiveTab(activeTab === "kumas" ? "" : "kumas")}
                  className="w-full flex justify-between items-center p-4 text-white hover:text-neon-pink transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  <span>
                    {t("fabric")} & {t("washing")}
                  </span>
                  <span>{activeTab === "kumas" ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeTab === "kumas" ? "max-h-40 p-4 pt-0" : "max-h-0 px-4"}`}
                >
                  <ul className="text-gray-400 font-light text-sm leading-relaxed list-disc list-inside">
                    <li>{t("fabric_type")}</li>
                    <li>{t("washing_instruction")}</li>
                  </ul>
                </div>
              </div>

              {/* Teslimat Tab */}
              <div className="border border-gray-800 bg-black/30">
                <button
                  onClick={() => setActiveTab(activeTab === "teslimat" ? "" : "teslimat")}
                  className="w-full flex justify-between items-center p-4 text-white hover:text-neon-pink transition-colors uppercase tracking-widest text-sm font-bold"
                >
                  <span>{t("fast_shipping")}</span>
                  <span>{activeTab === "teslimat" ? "−" : "+"}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${activeTab === "teslimat" ? "max-h-40 p-4 pt-0" : "max-h-0 px-4"}`}
                >
                  <p className="text-gray-400 font-light text-sm leading-relaxed mb-2">
                    📦 {t("fast_shipping_desc")}
                  </p>
                  <p className="text-gray-400 font-light text-sm leading-relaxed">
                    🔄 {t("return_policy")}
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-neon-pink rounded-full"></div> {t("fast_shipping")}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-holo-gold rounded-full"></div> {t("installment")}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div> {t("secure_shopping")}
              </li>
            </ul>
          </div>
        </div>

        {/* Müşteri Yorumları Section */}
        <div className="mt-24 border-t border-white/10 pt-16 relative">
          <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-10 text-center">
            {t("reviews_title")}
          </h3>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Add Review Form */}
            <div className="glass-panel p-8 clip-angled bg-black/40 border border-white/10 backdrop-blur-md">
              <h4 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">
                {t("write_review")}
              </h4>
              {session ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                      {t("your_rating")}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          aria-label={`${star} Yıldız`}
                          className={`text-2xl ${rating >= star ? "text-holo-gold" : "text-gray-600"} hover:text-holo-gold transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                      {t("your_comment")}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      aria-label={t("your_comment")}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-neon-pink transition-colors h-32 resize-none"
                      placeholder={t("comment_placeholder")}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-neon-pink text-white font-bold py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled disabled:opacity-50"
                  >
                    {isSubmittingReview ? t("sending") : t("send_comment")}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">{t("login_required_review")}</p>
                  <Link
                    href="/login"
                    className="inline-block bg-transparent border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white py-3 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm"
                  >
                    {t("login")}
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-white/10 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">
                            {review.user?.name || review.user?.email?.split("@")[0]}
                          </span>
                          <span className="text-gray-500 text-xs mt-0.5">{review.user?.email}</span>
                        </div>
                        <div className="flex text-holo-gold text-sm mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= review.rating ? "text-holo-gold" : "text-gray-600"}
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
                    <p className="text-gray-400 text-sm mt-2">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">{t("no_reviews_yet")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Benzer Ürünler (Related Products) */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-white/10 pt-16 relative">
            <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-holo-gold opacity-[0.02] rounded-full blur-[100px] pointer-events-none"></div>

            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-10 text-center">
              {t("similar_products")}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  href={`/urundetay/${rp.id}`}
                  key={rp.id}
                  className="group relative block glass-panel p-2 clip-angled transition-all hover:border-white/20"
                >
                  <div className="relative h-64 md:h-80 w-full overflow-hidden clip-angled mb-3">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <Image
                      src={getValidImageUrl(rp.resim || rp.gorsel?.split(',')[0])}
                      alt={rp.ad}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {rp.etiket && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-2 py-1">
                          {t(rp.etiket)}
                        </span>
                      </div>
                    )}

                    {/* Quick View Button - appears on hover */}
                    <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigating to product details page
                          setQuickViewProduct(rp);
                        }}
                        className="text-xs uppercase tracking-widest font-bold border-b border-gray-500 pb-1 text-white hover:text-neon-pink hover:border-neon-pink transition-colors mt-1 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm"
                      >
                        {t("quick_view")}
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">
                      {t(rp.kategori)}
                    </p>
                    <h4 className="text-white font-bold text-sm truncate mb-2">{t(rp.ad)}</h4>
                    <p className="text-neon-pink font-bold text-sm">{formatPrice(rp.fiyat)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY ADD TO CART BAR (Mobile mostly, but useful everywhere on scroll down) */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-t border-white/10 py-3 px-4 flex items-center justify-between md:hidden translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded overflow-hidden">
            <Image
              src={getValidImageUrl(product.resim || product.gorsel?.split(',')[0])}
              alt={product.ad}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-white font-bold text-xs truncate w-32">{product.ad}</h4>
            <span className="text-neon-pink text-xs font-bold">{formatPrice(product.fiyat)}</span>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-neon-pink text-white uppercase tracking-widest font-bold px-6 py-3 text-xs clip-angled hover:bg-white hover:text-black transition-colors"
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
