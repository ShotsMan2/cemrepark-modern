import Image from "next/image";
import Link from "next/link";
import { searchProducts } from "../../data/products";

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || "";
  const results = searchProducts(query);

  return (
    <>
      <section className="bg-light py-5 mt-5">
        <div className="container">
          <div className="row justify-content-center">
            <h1 className="section-title text-center mt-4">Arama Sonuçları: {query}</h1>
            <div className="col-md-6 text-center">
              <p>{results.length} ürün bulundu.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-5 pt-4">
        {results.length === 0 ? (
          <div className="alert alert-warning text-center">
            "{query}" ile eşleşen ürün bulunamadı. Lütfen başka bir kelime deneyin.
          </div>
        ) : (
          <div className="row mt-4">
            {results.map((product) => (
              <div key={product.id} className="col-md-3 col-sm-6 mb-4">
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
        )}
      </div>
    </>
  );
}
