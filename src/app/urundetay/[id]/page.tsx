import ProductDetailsClient from "./ProductDetailsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

  if (!product) {
    return {
      title: "Ürün Bulunamadı",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const imageUrl =
    product.resim || (product.gorsel ? product.gorsel.split(",")[0] : "");
  const absoluteImageUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
  const encodedTitle = encodeURIComponent(product.ad);
  const encodedPrice = encodeURIComponent(product.fiyat.toString());
  const encodedCategory = encodeURIComponent(product.kategori || "");
  const encodedImage = encodeURIComponent(absoluteImageUrl);
  const ogImage = `${baseUrl}/api/og?title=${encodedTitle}&price=${encodedPrice}&category=${encodedCategory}&image=${encodedImage}`;

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
    alternates: {
      canonical: `${baseUrl}/urundetay/${product.id}`,
    },
  };
}

export default async function UrunDetay({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { colors: true },
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24">
        <h2 className="text-foreground text-3xl font-bold">Ürün Bulunamadı</h2>
      </div>
    );
  }

  let relatedProducts = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${product.id}/recommendations`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (res.ok) {
      relatedProducts = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch recommendations", e);
  }

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
  const imageUrl = product.resim || (product.gorsel ? product.gorsel.split(",")[0] : "");

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.ad,
    image: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`,
    description: `${product.ad} - Cemre Park online mağazasında inceleyin.`,
    sku: product.id.toString(),
    mpn: product.id.toString(),
    brand: {
      "@type": "Brand",
      name: "Cemre Park",
    },
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

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
    };
    jsonLd.review = reviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
      },
      author: {
        "@type": "Person",
        name: r.user?.name || "Anonim",
      },
    }));
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.kategori || "Ürünler",
        item: `${baseUrl}/search?q=${product.kategori || ""}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.ad,
        item: `${baseUrl}/urundetay/${product.id}`,
      },
    ],
  };

  const schemaArr = [jsonLd, breadcrumbJsonLd];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArr) }}
      />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={reviews}
      />
    </>
  );
}
