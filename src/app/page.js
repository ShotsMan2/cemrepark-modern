import Image from "next/image";
import Link from "next/link";
import { products } from "../data/products";

export default function Home() {
  const bestSellers = products.slice(0, 4);
  const discounted = products.slice(4, 8);

  return (
    <>
      {/* SLIDER ALANI */}
      <section id="billboard" className="bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <h1 className="section-title text-center mt-4" data-aos="fade-up">Cemre Park</h1>
            <div className="col-md-6 text-center" data-aos="fade-up" data-aos-delay="300">
              <p>Tesettür Giyimde Şıklık ve Kalitenin Yeni Adresi</p>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-lg-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="text-content text-lg-start text-center mb-5 mb-lg-0" data-aos="fade-right">
                <h2 className="display-4 fw-bold mb-4" style={{ color: 'var(--clr-terracotta)' }}>Yeni Sezon<br />Koleksiyonu</h2>
                <p className="lead mb-4">En trend parçalarla tarzınızı yansıtın.</p>
                <Link href="/kategori" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
                  Şimdi Keşfet
                </Link>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="geo-image-wrapper">
                <Image src="/assets/siteimg/yeni1.jpg" alt="Yeni Sezon" width={600} height={800} className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÇOK SATANLAR */}
      <div className="container mt-5 pt-4">
        <div className="text-center" data-aos="fade-up">
          <h2 className="geo-section-title" style={{ color: 'var(--clr-terracotta)' }}>Çok Satanlar</h2>
        </div>
        <div className="row mt-4">
          {bestSellers.map((product, index) => (
            <div key={product.id} className="col-md-3 col-sm-6 mb-4" data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
              <Link href={`/urundetay/${product.id}`} className="geo-card">
                <div className="geo-card-img">
                  <Image src={product.gorsel} alt={product.ad} width={300} height={400} />
                </div>
                <div className="geo-card-body text-center d-flex flex-column p-3">
                  <div className="text-dark d-block" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h5 className="mb-2" style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.4 }}>{product.ad.toUpperCase()}</h5>
                  </div>
                  <p className="text-muted small mb-2">+2 renk</p>
                  <div className="geo-price mb-3" style={{ color: '#E11C8E', fontSize: '1.1rem', fontWeight: 700 }}>
                    {product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* VİTRİN GÖRSELLERİ */}
      <div className="container my-5 py-4">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="geo-image-wrapper">
              <Image src="/assets/siteimg/yeni2.jpg" alt="Tunik ve Pantolon" width={600} height={800} className="img-fluid w-100" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="geo-image-wrapper" style={{ '--clip-asym-1': 'polygon(10% 0, 100% 0, 100% 90%, 0 100%, 0 10%)' }}>
              <Image src="/assets/siteimg/yeni1.jpg" alt="İkili Takım" width={600} height={800} className="img-fluid w-100" />
            </div>
          </div>
        </div>
      </div>

      {/* İNDİRİMLİ ÜRÜNLER */}
      <div className="container mt-5">
        <div className="text-center">
          <h2 className="geo-section-title">İndirimli Ürünler</h2>
        </div>
        <div className="row mt-4">
          {discounted.map((product) => (
            <div key={product.id} className="col-md-3 col-sm-6 mb-4">
              <Link href={`/urundetay/${product.id}`} className="geo-card">
                <div className="geo-card-img">
                  <Image src={product.gorsel} alt={product.ad} width={300} height={400} />
                </div>
                <div className="geo-card-body text-center d-flex flex-column p-3">
                  <div className="text-dark d-block" style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h5 className="mb-2" style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.4 }}>{product.ad.toUpperCase()}</h5>
                  </div>
                  <p className="text-muted small mb-2">+1 renk</p>
                  <div className="geo-price mb-3" style={{ color: '#E11C8E', fontSize: '1.1rem', fontWeight: 700 }}>
                    {product.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* GÜVEN LİSTESİ */}
      <div className="container my-5">
        <div className="row text-center g-4">
          <div className="col-md-3 col-sm-6">
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <i className="fa-solid fa-truck-fast mb-3" style={{ fontSize: '2.5rem', color: 'var(--clr-terracotta)' }}></i>
              <h6 className="fw-bold">Hızlı Kargo</h6>
              <p className="text-muted small mb-0">Türkiye'nin her yerine kargo</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <i className="fa-brands fa-whatsapp mb-3" style={{ fontSize: '2.5rem', color: 'var(--clr-sage-green)' }}></i>
              <h6 className="fw-bold">WhatsApp Sipariş</h6>
              <p className="text-muted small mb-0">0554 169 89 09</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <i className="fa-solid fa-credit-card mb-3" style={{ fontSize: '2.5rem', color: 'var(--clr-gold)' }}></i>
              <h6 className="fw-bold">Ödeme Kolaylığı</h6>
              <p className="text-muted small mb-0">Havale/EFT ve Kapıda Kredi Kartı</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
              <i className="fa-solid fa-rotate-left mb-3" style={{ fontSize: '2.5rem', color: 'var(--clr-terracotta)' }}></i>
              <h6 className="fw-bold">İade Yok / Değişim Var</h6>
              <p className="text-muted small mb-0">İade ❌ Değişim ✅ (3 Gün)</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
