"use client";
import { use } from "react";
import Image from "next/image";
import { getProductById } from "../../../data/products";
import Swal from "sweetalert2";

export default function UrunDetay({ params }) {
  const unwrappedParams = use(params);
  const product = getProductById(unwrappedParams.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24">
        <h2 className="text-white text-3xl font-bold">Ürün Bulunamadı</h2>
      </div>
    );
  }

  const handleAddToCart = () => {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      icon: 'success',
      title: 'Sepete Eklendi!',
      text: product.ad + ' sepetinize başarıyla eklendi.',
      background: 'rgba(10, 10, 10, 0.9)',
      color: '#fff',
      iconColor: '#ff007f',
      customClass: {
        popup: 'border border-neon-pink backdrop-blur-md rounded-xl'
      }
    });
  };

  const handleAddToFavorites = () => {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      icon: 'success',
      title: 'Favorilere Eklendi!',
      text: product.ad + ' favorilerinize kaydedildi.',
      background: 'rgba(10, 10, 10, 0.9)',
      color: '#fff',
      iconColor: '#ffd700',
      customClass: {
        popup: 'border border-holo-gold backdrop-blur-md rounded-xl'
      }
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-neon-pink opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-holo-gold opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Image Section - Floating and Clipped */}
          <div className="w-full lg:w-1/2 relative group" data-aos="fade-right">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink to-holo-gold rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass-panel p-2 clip-angled">
              <div className="relative w-full h-[600px] md:h-[800px] clip-angled overflow-hidden">
                <Image 
                  src={product.gorsel} 
                  alt={product.ad} 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700" 
                  priority 
                />
              </div>
            </div>
            
            {/* Holographic floating element */}
            <div className="absolute -left-8 top-20 w-16 h-16 border border-holo-gold opacity-30 clip-hexa float-fx hidden md:block"></div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 glass-panel p-8 md:p-12 clip-angled" data-aos="fade-left">
            <span className="text-neon-pink tracking-[0.2em] text-xs font-bold uppercase mb-4 block">YENİ SEZON</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{product.ad}</h1>
            
            <h2 className="text-3xl font-bold text-glow-gold mb-8">
              {product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </h2>

            <div className="h-px w-full bg-white/10 mb-8"></div>

            {/* Select Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Beden</label>
                <div className="relative">
                  <select defaultValue="" className="block appearance-none w-full bg-black border border-gray-700 text-white py-3 px-4 pr-8 rounded-none leading-tight focus:outline-none focus:border-neon-pink transition-colors">
                    <option value="" disabled>Beden Seçiniz</option>
                    <option value="38">38</option>
                    <option value="40">40</option>
                    <option value="42">42</option>
                    <option value="44">44</option>
                    <option value="46">46</option>
                    <option value="48">48</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Renk</label>
                <div className="relative">
                  <select defaultValue="" className="block appearance-none w-full bg-black border border-gray-700 text-white py-3 px-4 pr-8 rounded-none leading-tight focus:outline-none focus:border-holo-gold transition-colors">
                    <option value="" disabled>Renk Seçiniz</option>
                    <option value="1">Siyah</option>
                    <option value="2">Ekru</option>
                    <option value="3">Taba</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <button onClick={handleAddToCart} className="flex-1 bg-transparent border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white py-4 px-8 uppercase font-bold tracking-widest transition-all duration-300 clip-angled text-sm">
                Sepete Ekle
              </button>
              <button onClick={handleAddToFavorites} className="w-16 flex items-center justify-center border border-gray-700 text-gray-400 hover:text-holo-gold hover:border-holo-gold transition-all duration-300 clip-angled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>

            <div className="h-px w-full bg-white/10 mb-8"></div>

            <h3 className="text-white font-bold uppercase tracking-wider mb-4">Ürün Detayları</h3>
            <p className="text-gray-400 leading-relaxed font-light text-sm">
              {product.ad} - Cemre Park kalitesiyle özenle üretilmiştir. Tam kalıp, kullandığınız bedeni tercih edebilirsiniz. Kumaş dokusu ve rahatlığıyla gün boyu şıklığınızı tamamlar. Güvenli ödeme ve hızlı kargo ile hemen sahip olun.
            </p>

            <ul className="mt-6 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-neon-pink rounded-full"></div> Hızlı Teslimat (1-3 İş Günü)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-holo-gold rounded-full"></div> Kapıda Ödeme Seçeneği
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div> %100 Güvenli Alışveriş
              </li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  );
}
