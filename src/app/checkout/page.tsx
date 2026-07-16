'use client';
import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getValidImageUrl } from '../../utils/imageHelper';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

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
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Kupon uygulandı!', showConfirmButton: false, timer: 3000 });
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
      Swal.fire({ title: 'Siparişiniz Alındı!', text: 'Siparişiniz başarıyla oluşturuldu.', icon: 'success' }).then(() => { clearCart(); router.push('/'); });
    } catch (error: any) { Swal.fire('Hata', error.message, 'error'); } finally { setIsProcessing(false); }
  };

  if (!isLoaded || cartItems.length === 0) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-50 via-white to-gray-50 dark:from-pink-950/20 dark:via-zinc-900/50 dark:to-black/30 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-gray-900 dark:text-white uppercase tracking-tight text-center" data-aos="fade-down">
          {t('checkout_title')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3" data-aos="fade-right">
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-8">
              <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/10 pb-4">1. Teslimat Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['fullName', 'email', 'phone', 'city'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t(field === 'fullName' ? 'full_name' : field === 'city' ? 'district' : field)}</label>
                      <input required type={field === 'email' ? 'email' : 'text'} name={field} value={(formData as any)[field]} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent transition-all" />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{t('address')}</label>
                    <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-transparent transition-all resize-none"></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/10 pb-4">2. Ödeme Bilgileri</h2>
                
                {/* Modern Card Visual */}
                <div className="max-w-sm mx-auto mb-8 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl transform transition-transform hover:-translate-y-2 duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-8 bg-yellow-400 rounded opacity-80"></div>
                    <span className="text-white font-bold tracking-widest text-lg">VISA</span>
                  </div>
                  <div className="text-white text-2xl tracking-[0.2em] font-mono mb-4">{formData.cardNumber || '•••• •••• •••• ••••'}</div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span className="uppercase tracking-widest truncate w-32">{formData.fullName || 'AD SOYAD'}</span>
                    <span className="font-mono">{formData.cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Kart Numarası</label>
                    <input required type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} maxLength={19} className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl p-4 font-mono focus:ring-2 focus:ring-neon-pink focus:outline-none" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">SKT</label>
                    <input required type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} maxLength={5} className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl p-4 font-mono focus:ring-2 focus:ring-neon-pink focus:outline-none" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">CVV</label>
                    <input required type="text" name="cardCvv" value={formData.cardCvv} onChange={handleInputChange} maxLength={3} className="w-full bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl p-4 font-mono focus:ring-2 focus:ring-neon-pink focus:outline-none" placeholder="***" />
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={isProcessing} className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-neon-pink hover:shadow-xl hover:shadow-neon-pink/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3">
                {isProcessing ? 'İşleniyor...' : `ÖDEMEYİ TAMAMLA - ${formatPrice(totalAmount)}`}
              </button>
            </form>
          </div>

          <div className="w-full lg:w-1/3" data-aos="fade-left" data-aos-delay="200">
            <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 sticky top-32">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wide border-b border-gray-100 dark:border-white/10 pb-4">Sipariş Özeti</h2>
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cartItems.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                      <Image src={getValidImageUrl(item.gorsel)} alt={item.ad} fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{t(item.ad)}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.beden} | {item.renk}</p>
                      <p className="text-sm text-neon-pink font-bold mt-1">{item.quantity} x {formatPrice(item.fiyat)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-gray-100 dark:bg-white/10 my-6"></div>

              <div className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-300 mb-6">
                <div className="flex justify-between"><span>{t('subtotal')}</span><span className="text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span></div>
                <div className="flex justify-between"><span>{t('shipping')}</span><span className={shippingCost === 0 ? "text-emerald-500 font-bold" : "text-gray-900 dark:text-white"}>{shippingCost === 0 ? t('free') : formatPrice(shippingCost)}</span></div>
                {appliedCoupon && <div className="flex justify-between text-neon-pink font-bold"><span>İndirim</span><span>-{formatPrice(discountAmount)}</span></div>}
              </div>

              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Kupon Kodu" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 bg-gray-50 dark:bg-zinc-950/55 border border-gray-200 dark:border-white/10 rounded-lg px-4 focus:ring-2 focus:ring-neon-pink outline-none uppercase text-sm text-gray-900 dark:text-white" />
                    <button type="button" onClick={applyCoupon} disabled={isApplyingCoupon || !couponCode} className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-neon-pink dark:hover:bg-neon-pink dark:hover:text-white transition-colors">Uygula</button>
                  </div>
                ) : (
                  <div className="bg-neon-pink/10 border border-neon-pink/20 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-neon-pink font-bold text-sm">{appliedCoupon.code}</p>
                      <p className="text-gray-500 text-xs">İndirim uygulandı</p>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-red-500 text-xs font-bold uppercase">Kaldır</button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
              </div>

              <div className="flex justify-between items-center text-lg mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                <span className="text-gray-900 dark:text-white font-black">{t('total')}</span>
                <span className="text-neon-pink font-black text-2xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
