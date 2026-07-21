import React from "react";

interface ProductJsonLdProps {
  product: {
    id: number;
    ad: string;
    aciklama?: string;
    fiyat: number;
    gorsel?: string;
    kategori?: string;
    stok: number;
  };
  baseUrl: string;
}

export default function ProductJsonLd({ product, baseUrl }: ProductJsonLdProps) {
  if (!product) return null;

  const images = product.gorsel ? product.gorsel.split(",").map((img) => img.trim()) : [];
  const primaryImage =
    images.length > 0 ? (images[0].startsWith("http") ? images[0] : `${baseUrl}${images[0]}`) : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.ad,
    description: product.aciklama || `${product.ad} - Cemre Park'ta en uygun fiyatlarla!`,
    image: primaryImage,
    sku: `PRD-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Cemre Park",
    },
    category: product.kategori || "Giyim",
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: product.fiyat,
      availability:
        product.stok > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${baseUrl}/urundetay/${product.id}`,
      seller: {
        "@type": "Organization",
        name: "Cemre Park",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
