import { getProductById } from "../../../data/products";
import ProductDetailsClient from "./ProductDetailsClient";

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

  return <ProductDetailsClient product={product} />;
}
