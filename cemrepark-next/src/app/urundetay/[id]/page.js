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
      <div className="container py-5 mt-5 text-center">
        <h2>Ürün Bulunamadı</h2>
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
      background: 'var(--clr-terracotta)',
      color: '#fff',
      iconColor: '#fff'
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
    });
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="geo-card h-100 p-3">
            <Image src={product.gorsel} className="img-fluid rounded" alt={product.ad} width={600} height={800} />
          </div>
        </div>
        <div className="col-md-6">
          <h3 className="geo-section-title" style={{ marginBottom: '1rem' }}>{product.ad}</h3>
          <h4 className="geo-price mb-4">
            {product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </h4>
          <hr />
          <div className="form-floating mb-3">
            <select className="form-select" id="bedenSelect" aria-label="Beden Seçimi" defaultValue="0">
              <option value="0" disabled>Seçiniz</option>
              <option value="1">38</option>
              <option value="2">40</option>
              <option value="3">42</option>
              <option value="4">44</option>
              <option value="5">46</option>
              <option value="6">48</option>
            </select>
            <label htmlFor="bedenSelect">Beden</label>
          </div>
          <div className="form-floating mb-4">
            <select className="form-select" id="renkSelect" aria-label="Renk Seçimi" defaultValue="0">
              <option value="0" disabled>Seçiniz</option>
              <option value="1">Siyah</option>
              <option value="2">Ekru</option>
              <option value="3">Taba</option>
            </select>
            <label htmlFor="renkSelect">Renk</label>
          </div>
          <hr />

          <div className="d-flex gap-3 mb-4">
            <button onClick={handleAddToCart} className="btn-geo py-3 px-5 fs-5 flex-grow-1" style={{ transition: 'all 0.3s' }}>
              Sepete Ekle
            </button>
            <button onClick={handleAddToFavorites} className="btn-geo-outline py-3 px-4" style={{ transition: 'all 0.3s' }}>
              <i className="fa-regular fa-heart fs-4"></i>
            </button>
          </div>
          <hr />
          <h5>Ürün Açıklaması</h5>
          <p className="text-muted">
            {product.ad} - Cemre Park kalitesiyle özenle üretilmiştir. 
            Tam kalıp, kullandığınız bedeni tercih edebilirsiniz. 
            Kumaş dokusu ve rahatlığıyla gün boyu şıklığınızı tamamlar. 
            Güvenli ödeme ve hızlı kargo ile hemen sahip olun.
          </p>
        </div>
      </div>
    </div>
  );
}
