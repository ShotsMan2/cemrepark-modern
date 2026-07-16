'use client';
import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getValidImageUrl } from '../../utils/imageHelper';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, formatPrice, t } = useStore();
  const { data: session } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', cardNumber: '', cardExpiry: '', cardCvv: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    setIsLoaded(true);
    if (cartItems.length === 0) router.push('/cart');
  }, [cartItems, router]);

  const cartTotal = cartItems.reduce((acc: number, item: any) => acc + item.fiyat * item.quantity, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountType === 'PERCENTAGE' ? (cartTotal * appliedCoupon.discountValue) / 100 : appliedCoupon.discountValue;
    if (discountAmount > cartTotal) discountAmount = cartTotal;
  }
  const FREE_SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE = 49.90;
  const subtotalAfterDiscount = cartTotal - discountAmount;
  const shippingCost = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount = subtotalAfterDiscount + shippingCost;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const parts = v.match(/.{1,4}/g) || [];
      setFormData({ ...formData, cardNumber: parts.join(' ') });
      return;
    }
    if (name === 'cardExpiry') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) setFormData({ ...formData, cardExpiry: `${v.substring(0, 2)}/${v.substring(2, 4)}` });
      else setFormData({ ...formData, cardExpiry: v });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode, cartTotal }) });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Kupon uygulandı!', showConfirmButton: false, timer: 3000, background: '#18181b', color: '#fff', iconColor: '#ff007f' });
      } else setCouponError(data.error || 'Geçersiz kupon kodu.');
    } catch (err) { setCouponError('Hata oluştu.'); } finally { setIsApplyingCoupon(false); }
  };

  const handlePayment = async (e: any) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        customer: formData.fullName, userId: (session?.user as any)?.id ? parseInt((session.user as any).id as string) : null,
        total: totalAmount, items: cartItems.map((i: any) => ({ productId: i.id, quantity: i.quantity })),
        couponCode: appliedCoupon?.code || null, discountAmount
      };
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Sipariş oluşturulamadı.');
      Swal.fire({ title: 'Siparişiniz Alındı!', text: 'Siparişiniz başarıyla oluşturuldu.', icon: 'success', background: '#18181b', color: '#fff', confirmButtonColor: '#ff007f' }).then(() => { clearCart(); router.push('/'); });
    } catch (error: any) { Swal.fire('Hata', error.message, 'error'); } finally { setIsProcessing(false); }
  };

  if (!isLoaded || cartItems.length === 0) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold uppercase tracking-tighter text-center" data-aos="fade-down">
          {t('checkout_title')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3" data-aos="fade-right">
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-8 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-neon-pink/20 transition-colors duration-1000"></div>
              
              <div className="relative z-10 space-y-12">
                {/* 1. TESLİMAT */}
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-neon-pink text-white flex items-center justify-center text-lg shadow-lg shadow-neon-pink/40">1</span>
                    Teslimat Bilgileri
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['fullName', 'email', 'phone', 'city'].map((field) => (
                      <div key={field} className="relative group/input">
                        <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest group-focus-within/input:text-neon-pink transition-colors">{t(field === 'fullName' ? 'full_name' : field === 'city' ? 'district' : field)}</label>
                        <input required type={field === 'email' ? 'email' : 'text'} name={field} value={(formData as any)[field]} onChange={handleInputChange} className="w-full bg-white/70 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent transition-all backdrop-blur-sm shadow-inner font-medium" />
                      </div>
                    ))}
                    <div className="md:col-span-2 relative group/input">
                      <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest group-focus-within/input:text-neon-pink transition-colors">{t('address')}</label>
                      <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full bg-white/70 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent transition-all resize-none backdrop-blur-sm shadow-inner font-medium"></textarea>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>

                {/* 2. ÖDEME */}
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-holo-gold text-gray-900 flex items-center justify-center text-lg shadow-lg shadow-holo-gold/40">2</span>
                    Ödeme Bilgileri
                  </h2>
                  
                  {/* Modern Card Visual */}
                  <div className="max-w-sm mx-auto mb-10 bg-gradient-to-br from-gray-900 via-zinc-800 to-black rounded-3xl p-8 shadow-2xl border border-white/10 transform transition-transform duration-500 hover:scale-105 hover:-rotate-1 relative overflow-hidden group/card">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover/card:-translate-x-full duration-1000 ease-in-out transition-transform"></div>
                    <div className="flex justify-between items-center mb-10 relative z-10">
                      <div className="w-14 h-10 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md opacity-90 shadow-sm flex items-center justify-center">
                        <div className="w-8 h-6 border border-yellow-200/50 rounded-sm"></div>
                      </div>
                      <div className="flex -space-x-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/80 mix-blend-screen"></div>
                        <div className="w-10 h-10 rounded-full bg-yellow-500/80 mix-blend-screen"></div>
                      </div>
                    </div>
                    <div className="text-white text-3xl tracking-[0.15em] font-mono mb-6 drop-shadow-md relative z-10">{formData.cardNumber || '•••• •••• •••• ••••'}</div>
                    <div className="flex justify-between text-gray-300 text-sm relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Card Holder</span>
                        <span className="uppercase tracking-widest truncate w-32 font-bold">{formData.fullName || 'AD SOYAD'}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Expires</span>
                        <span className="font-mono font-bold tracking-widest">{formData.cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 relative group/input">
                      <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest group-focus-within/input:text-holo-gold transition-colors">Kart Numarası</label>
                      <input required type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} maxLength={19} className="w-full bg-white/70 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-4 font-mono font-bold tracking-widest focus:ring-2 focus:ring-holo-gold focus:outline-none transition-all shadow-inner" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="relative group/input">
                      <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest group-focus-within/input:text-holo-gold transition-colors">SKT</label>
                      <input required type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} maxLength={5} className="w-full bg-white/70 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-4 font-mono font-bold tracking-widest focus:ring-2 focus:ring-holo-gold focus:outline-none transition-all shadow-inner text-center" placeholder="MM/YY" />
                    </div>
                    <div className="relative group/input">
                      <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest group-focus-within/input:text-holo-gold transition-colors">CVV</label>
                      <input required type="text" name="cardCvv" value={formData.cardCvv} onChange={handleInputChange} maxLength={3} className="w-full bg-white/70 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl p-4 font-mono font-bold tracking-widest focus:ring-2 focus:ring-holo-gold focus:outline-none transition-all shadow-inner text-center" placeholder="***" />
                    </div>
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={isProcessing} className="w-full bg-gradient-to-r from-neon-pink to-holo-gold text-white py-6 rounded-2xl font-black text-lg uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-neon-pink/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 mt-8">
                {isProcessing ? 'İşleniyor...' : (
                  <>
                    ÖDEMEYİ TAMAMLA
                    <span className="opacity-50">|</span>
                    {formatPrice(totalAmount)}
                    <svg className="w-6 h-6 ml-2 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="w-full lg:w-1/3" data-aos="fade-left" data-aos-delay="200">
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-white/10 sticky top-32">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-6">Sipariş Özeti</h2>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center group">
                    <div className="relative w-20 h-24 bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                      <Image src={getValidImageUrl(item.gorsel)} alt={item.ad} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="80px" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-neon-pink transition-colors">{t(item.ad)}</h4>
                      <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">
                        <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{item.beden}</span>
                        <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{item.renk}</span>
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {item.quantity} <span className="text-gray-400 mx-1">x</span> {formatPrice(item.fiyat)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Kupon Kodu" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 bg-white/70 dark:bg-zinc-950/60 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-neon-pink outline-none uppercase text-sm font-bold tracking-widest text-gray-900 dark:text-white shadow-inner" />
                    <button type="button" onClick={applyCoupon} disabled={isApplyingCoupon || !couponCode} className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-neon-pink dark:hover:bg-neon-pink hover:text-white dark:hover:text-white transition-all duration-300 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Uygula</button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-neon-pink/10 to-holo-gold/10 border border-neon-pink/20 rounded-xl p-4 flex justify-between items-center backdrop-blur-sm">
                    <div>
                      <p className="text-neon-pink font-black text-sm tracking-widest">{appliedCoupon.code}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-1">İndirim uygulandı</p>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{couponError}</p>}
              </div>

              <div className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300 mb-8 bg-white/40 dark:bg-zinc-800/40 p-6 rounded-2xl">
                <div className="flex justify-between items-center"><span>{t('subtotal')}</span><span className="text-gray-900 dark:text-white text-base">{formatPrice(cartTotal)}</span></div>
                <div className="flex justify-between items-center"><span>{t('shipping')}</span><span className={shippingCost === 0 ? "text-emerald-500 uppercase tracking-widest text-xs bg-emerald-500/10 px-2 py-1 rounded-md" : "text-gray-900 dark:text-white text-base"}>{shippingCost === 0 ? t('free') : formatPrice(shippingCost)}</span></div>
                {appliedCoupon && <div className="flex justify-between items-center text-neon-pink pt-4 border-t border-gray-200 dark:border-white/10 mt-4"><span>İndirim</span><span className="text-base">-{formatPrice(discountAmount)}</span></div>}
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-gray-200 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-sm">Toplam</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-holo-gold font-black text-4xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
