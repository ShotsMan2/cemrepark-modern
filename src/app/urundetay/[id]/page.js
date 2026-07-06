import { getProductById, getProducts } from "../../../data/products";
import ProductDetailsClient from "./ProductDetailsClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: "Ürün Bulunamadı",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const imageUrl = product.gorsel || product.resim || "/images/og-image.jpg";
  const ogImage = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;

  return {
    title: product.ad,
    description: `${product.ad} ürünü - ${product.fiyat} ₺. Cemre Park online mağazasında inceleyin.`,
    openGraph: {
      title: product.ad,
      description: `${product.ad} ürünü - ${product.fiyat} ₺`,
      url: `${baseUrl}/urundetay/${product.id}`,
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.ad,
      description: `${product.ad} ürünü - ${product.fiyat} ₺`,
      images: [ogImage],
    },
  };
}

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
    .filter((p) => p.kategori === product.kategori && p.id !== product.id)
    .slice(0, 4);

  const reviews = await prisma.review.findMany({
    where: { productId: parseInt(id) },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const imageUrl = product.gorsel || product.resim || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.ad,
    image: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`,
    description: `${product.ad} - Cemre Park online mağazasında inceleyin.`,
    sku: product.id.toString(),
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/urundetay/${product.id}`,
      priceCurrency: "TRY",
      price: product.fiyat,
      availability:
        product.stok > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={reviews}
      />
    </>
  );
}
