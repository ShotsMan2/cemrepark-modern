"use client";
import { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.fiyat * item.quantity), 0);

  const getCardType = (number) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'MASTERCARD';
    if (/^9792/.test(num) || /^65/.test(num)) return 'TROY';
    if (/^3[47]/.test(num)) return 'AMEX';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === "cardNumber") {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      let parts = [];
      for (let i=0, len=match.length; i<len; i+=4) {
        parts.push(match.substring(i, i+4));
      }
      if (parts.length) {
        setFormData({...formData, cardNumber: parts.join(' ')});
        return;
      } else {
        setFormData({...formData, cardNumber: value});
        return;
      }
    }
    
    // Format expiry
    if (name === "cardExpiry") {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) {
        setFormData({...formData, cardExpiry: `${v.substring(0,2)}/${v.substring(2,4)}`});
      } else {
        setFormData({...formData, cardExpiry: v});
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment API call
    setTimeout(() => {
      setIsProcessing(false);
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({
          title: 'Ödeme Başarılı!',
          text: 'Siparişiniz başarıyla alınmıştır. Bizi tercih ettiğiniz için teşekkür ederiz.',
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#ff007f',
          confirmButtonText: 'Alışverişe Dön'
        }).then(() => {
          if(clearCart) clearCart(); // Clear the cart context
          router.push("/");
        });
      }
    }, 2000);
  };

  if (!isLoaded || cartItems.length === 0) return null;

  return (
    <div className="min-h-[70vh] pt-24 pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-neon-pink opacity-5 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-widest uppercase text-glow-pink text-center">GÜVENLİ ÖDEME</h1>

        <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto">
          
          {/* LEFT: PAYMENT FORM */}
          <div className="w-full lg:w-2/3">
            <form onSubmit={handlePayment} className="space-y-8">
              
              {/* Teslimat Bilgileri */}
              <div className="glass-panel p-6 md:p-8 rounded-xl border border-white/5">
                <h2 className="text-xl font-bold mb-6 text-holo-gold border-b border-white/10 pb-4">1. Teslimat Bilgileri</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ad Soyad</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink transition-colors" placeholder="Adınız Soyadınız" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">E-posta Adresi</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink transition-colors" placeholder="ornek@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Telefon Numarası</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink transition-colors" placeholder="0 (5XX) XXX XX XX" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">İlçe / İl</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink transition-colors" placeholder="Örn: Kadıköy, İstanbul" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Açık Adres</label>
                    <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-pink transition-colors resize-none" placeholder="Mahalle, sokak, bina, daire vb."></textarea>
                  </div>
                </div>
              </div>

              {/* Kredi Kartı Bilgileri */}
              <div className="glass-panel p-6 md:p-8 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                </div>
                
                <h2 className="text-xl font-bold mb-6 text-holo-gold border-b border-white/10 pb-4">2. Ödeme Bilgileri</h2>
                
                {/* Credit Card Mock Visual */}
                <div className="w-full max-w-sm mx-auto mb-8 h-52 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                  <div className="flex justify-between items-start z-10">
                    <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="30" rx="4" fill="#ffd700" fillOpacity="0.8"/><rect x="5" y="5" width="10" height="20" rx="1" fill="#fff" fillOpacity="0.3"/><rect x="25" y="5" width="10" height="20" rx="1" fill="#fff" fillOpacity="0.3"/></svg>
                    <div className="text-white/80 text-xl font-bold italic tracking-wider">{getCardType(formData.cardNumber)}</div>
                  </div>
                  <div className="z-10">
                    <div className="text-white text-xl md:text-2xl tracking-[0.2em] font-mono mb-2">
                      {formData.cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm uppercase">
                      <span className="truncate max-w-[150px]">{formData.fullName || "AD SOYAD"}</span>
                      <span>{formData.cardExpiry || "AA/YY"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Kart Numarası</label>
                    <input required type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} maxLength="19" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-neon-pink transition-colors" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Son Kullanma (AA/YY)</label>
                    <input required type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} maxLength="5" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-neon-pink transition-colors" placeholder="AA/YY" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">CVV</label>
                    <input required type="text" name="cardCvv" value={formData.cardCvv} onChange={handleInputChange} maxLength="3" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-neon-pink transition-colors" placeholder="***" />
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
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ÖDEMEYİ TAMAMLA
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                256-bit SSL sertifikası ile ödemeniz güvence altındadır.
              </div>
            </form>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-1/3">
            <div className="glass-panel p-6 md:p-8 border border-white/5 sticky top-32">
              <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-widest border-b border-white/10 pb-4">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-white/5 rounded overflow-hidden flex-shrink-0">
                      <Image src={item.resim || "/assets/siteimg/dummy1.jpg"} alt={item.ad} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.ad}</h4>
                      <p className="text-xs text-gray-400 mt-1">Beden: {item.beden} | Renk: {item.renk}</p>
                      <p className="text-xs text-neon-pink font-bold mt-1">{item.quantity} x {item.fiyat} TL</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-px w-full bg-white/10 mb-6"></div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Ara Toplam</span>
                  <span className="text-white">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Kargo Ücreti</span>
                  <span className="text-green-400">Ücretsiz</span>
                </div>
              </div>
              
              <div className="h-px w-full bg-white/10 mb-6"></div>
              
              <div className="flex justify-between items-center text-lg">
                <span className="text-white font-bold">Toplam</span>
                <span className="text-glow-gold font-black">{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
