import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Fetch data
  const products = await prisma.product.findMany({
    select: { id: true },
  });

  const pages = await prisma.page.findMany({
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/urundetay/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const pageUrls = pages.map((page) => ({
    url: `${baseUrl}/kurumsal/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const routes = [
    '',
    '/search',
    '/cart',
    '/checkout',
    '/favorites',
    '/hesabim',
    '/hesabim/siparislerim'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.6,
  }));

  return [...routes, ...productUrls, ...pageUrls];
}
