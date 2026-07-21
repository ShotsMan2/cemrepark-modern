import React from "react";

interface ProductSchemaProps {
  product: {
    name: string;
    description?: string;
    image?: string;
    id: string;
    price: number | string;
    stock?: number;
    slug?: string;
  };
}

export default function ProductSchema({ product }: ProductSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Buy ${product.name} at Cemre Park.`,
    image: product.image || "https://cemrepark.com/default-product.jpg",
    sku: product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "TRY",
      availability:
        (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://cemrepark.com/product/${product.slug || product.id}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
