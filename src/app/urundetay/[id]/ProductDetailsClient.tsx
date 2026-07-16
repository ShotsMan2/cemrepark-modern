'use client';
import { useState } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { useStore } from '../../../context/StoreContext';
import FavoriteButton from '../../../components/FavoriteButton';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getValidImageUrl } from '../../../utils/imageHelper';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const QuickViewModal = dynamic(() => import('../../../components/QuickViewModal'), { ssr: false });

export default function ProductDetailsClient({
  product,
  relatedProducts = [],
  initialReviews = [],
}: any) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart, formatPrice, t } = useStore();
  const [beden, setBeden] = useState('');
  const [renk, setRenk] = useState('');
  const [activeTab, setActiveTab] = useState('detay');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const bedenList = product.beden ? product.beden.split(',').map((s: string) => s.trim()) : ['Standart'];
  const hasColors = product.colors && product.colors.length > 0;
  const renkList = hasColors 
    ? product.colors.map((c: any) => c.renkAdi) 
    : (product.renk ? product.renk.split(',').map((s: string) => s.trim()) : ['Standart']);

  const selectedColorObj = hasColors ? product.colors.find((c: any) => c.renkAdi === (renk || renkList[0])) : null;
  const activeImageUrl = selectedColorObj?.gorselUrl || product.resim || product.gorsel?.split(',')[0];

  let swiperImages = [];
  if (product.gorsel) swiperImages = product.gorsel.split(',').map((url: string) => url.trim()).filter(Boolean);
  else if (product.resim) swiperImages = [product.resim];
  
  if (selectedColorObj && selectedColorObj.gorselUrl) {
    swiperImages = [selectedColorObj.gorselUrl, ...swiperImages.filter((img: string) => img !== selectedColorObj.gorselUrl)];
  }
  if (swiperImages.length === 0) swiperImages = ['/images/placeholder.jpg'];

  const handleAddToCart = () => {
    if (!beden || !renk) {
      Swal.fire({
        toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: t('review_warning_selection_title'), text: t('review_warning_selection_desc'),
        customClass: { popup: 'rounded-xl shadow-lg border border-gray-100 bg-white' }
      });
      return;
    }

    addToCart(product, beden, renk);
    Swal.fire({
      toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000,
      icon: 'success', title: t('cart_added_title'), text: t('cart_added_desc', { name: t(product.ad) }),
      customClass: { popup: 'rounded-xl shadow-lg border border-gray-100 bg-white text-gray-900' },
      showClass: { popup: 'animate__animated animate__zoomInDown' } // Micro-animation setup example, if using animate.css
    });
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    if (!session) return router.push('/login');
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userId: (session.user as any).id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews([{ ...data.review, user: { name: session.user.name, email: session.user.email } }, ...reviews]);
      setComment(''); setRating(5);
      Swal.fire({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, icon: 'success', title: t('review_success_title'), text: t('review_success_desc') });
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Hata', text: err.message });
    } finally { setIsSubmittingReview(false); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 dark:from-pink-900/10 via-white dark:via-[#0a0a0a] to-gray-50 dark:to-[#0a0a0a] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <nav className="flex text-sm text-gray-500 uppercase tracking-widest mb-10 mt-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li><Link href="/" className="hover:text-neon-pink transition-colors">{t('home')}</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href={`/search?category=${product.kategori}`} className="hover:text-neon-pink transition-colors">{t(product.kategori) || t('collection')}</Link></li>
            <li><span className="mx-2">/</span></li>
            <li aria-current="page"><span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px] block">{t(product.ad)}</span></li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-1/2 relative group" data-aos="fade-right">
            <div className="relative bg-white dark:bg-[#111] rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-white/10 transition-colors duration-300">
              <div className="relative w-full h-[500px] md:h-[700px] rounded-2xl overflow-hidden shadow-inner bg-gray-100 dark:bg-black">
                <Swiper
                  modules={[Navigation, Pagination, EffectFade, Autoplay]}
                  effect="fade"
                  navigation
                  pagination={{ clickable: true, dynamicBullets: true }}
                  autoplay={{ delay: 6000, disableOnInteraction: true }}
                  className="w-full h-full"
                >
                  {swiperImages.map((imgSrc: string, idx: number) => (
                    <SwiperSlide key={idx}>
                      <Image
                        src={getValidImageUrl(imgSrc)}
                        alt={`${product.ad} - Görsel ${idx + 1}`}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 bg-white dark:bg-[#111] rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 dark:border-white/10 transition-colors duration-300" data-aos="fade-left">
            <span className="inline-block bg-pink-50 dark:bg-pink-900/30 text-neon-pink px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              {product.etiket ? t(product.etiket) : t('new_season')}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{t(product.ad)}</h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-yellow-400 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Number(avgRating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                ))}
              </div>
              <span className="text-gray-500 text-sm font-medium">{t('reviews_count', { count: reviews.length })}</span>
            </div>

            <h2 className="text-4xl font-black text-neon-pink mb-8">{formatPrice(product.fiyat)}</h2>

            <div className="h-px w-full bg-gray-100 dark:bg-white/10 mb-8 transition-colors duration-300"></div>

            <div className="space-y-8 mb-10">
              <div>
                <label className="block text-gray-900 dark:text-white text-sm font-bold mb-4 uppercase tracking-widest">{t('size')}</label>
                <div className="flex flex-wrap gap-3">
                  {bedenList.map((b: string) => (
                    <button
                      key={b}
                      onClick={() => setBeden(b)}
                      className={`w-14 h-14 rounded-xl font-bold uppercase text-sm transition-all duration-300 transform active:scale-95 ${
                        beden === b ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-white/10'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white text-sm font-bold mb-4 uppercase tracking-widest">{t('color')}</label>
                <div className="flex flex-wrap gap-3">
                  {renkList.map((r: string) => (
                    <button
                      key={r}
                      onClick={() => setRenk(r)}
                      className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all duration-300 transform active:scale-95 ${
                        renk === r ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-white/10'
                      }`}
                    >
                      {t(r) || r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-neon-pink dark:hover:bg-neon-pink dark:hover:text-white hover:shadow-xl hover:shadow-neon-pink/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
              >
                {t('add_to_cart')}
              </button>
              <div className="w-16 h-[60px] bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-gray-200 dark:border-white/10 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-neon-pink dark:hover:border-neon-pink transition-colors group">
                <FavoriteButton product={product} className="" />
              </div>
            </div>

            <div className="space-y-4">
              {['detay', 'kumas', 'teslimat'].map((tab) => (
                <div key={tab} className="border border-gray-100 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setActiveTab(activeTab === tab ? '' : tab)}
                    className="w-full flex justify-between items-center p-6 text-gray-900 dark:text-white font-bold uppercase tracking-widest text-sm"
                  >
                    <span>{tab === 'detay' ? t('product_specs') : tab === 'kumas' ? t('fabric') : t('fast_shipping')}</span>
                    <span className="text-xl leading-none">{activeTab === tab ? '−' : '+'}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeTab === tab ? 'max-h-40 px-6 pb-6 opacity-100' : 'max-h-0 px-6 opacity-0'}`}>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {tab === 'detay' ? t('quick_view_desc') : tab === 'kumas' ? t('fabric_type') : t('fast_shipping_desc')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-10 text-center">{t('similar_products')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp: any) => (
                <Link href={`/urundetay/${rp.id}`} key={rp.id} className="group bg-white dark:bg-[#111] rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-xl dark:hover:shadow-white/5 transition-all duration-300">
                  <div className="relative h-48 md:h-64 w-full rounded-2xl overflow-hidden mb-4">
                    <Image src={getValidImageUrl(rp.resim || rp.gorsel?.split(',')[0])} alt={rp.ad} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <div className="px-2">
                    <h4 className="text-gray-900 dark:text-white font-bold text-sm truncate mb-2">{t(rp.ad)}</h4>
                    <p className="text-neon-pink font-black">{formatPrice(rp.fiyat)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
}
