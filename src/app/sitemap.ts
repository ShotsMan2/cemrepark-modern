import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Fetch data
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const pages = await prisma.page.findMany({
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/urundetay/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/search?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}/kurumsal/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const routes = [
    "",
    "/search",
    "/cart",
    "/checkout",
    "/favorites",
    "/hesabim",
    "/hesabim/siparislerim",
    "/login",
    "/register",
    "/forgot-password",
    "/kurumsal"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.6,
  }));

  return [...routes, ...categoryUrls, ...productUrls, ...pageUrls];
}
