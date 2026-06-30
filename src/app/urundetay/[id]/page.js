import { getProductById, getProducts } from "../../../data/products";
import ProductDetailsClient from "./ProductDetailsClient";

export const dynamic = 'force-dynamic';

export default async function UrunDetay({ params }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24">
        <h2 className="text-white text-3xl font-bold">Ürün Bulunamadı</h2>
      </div>
    );
  }

  const allProducts = getProducts();
  const relatedProducts = allProducts
    .filter(p => p.kategori === product.kategori && p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
