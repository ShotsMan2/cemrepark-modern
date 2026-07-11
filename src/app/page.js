import { getProducts } from "../data/products";
import HomeClient from "./HomeClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Statik JSON yerine doğrudan güncel veritabanından veri çekiyoruz (Cursor & Trae entegrasyonu)
  let products = [];
  try {
    products = await prisma.product.findMany({
      take: 8,
      orderBy: { id: "desc" } // En son eklenen (Shopier) ürünler
    });
  } catch (error) {
    console.error("Ürünler çekilirken hata:", error);
  }

  const bestSellers = products.slice(0, 4);
  const discounted = products.slice(4, 8);

  let banners = [];
  try {
    banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch banners in page.js:", error);
  }

  return <HomeClient bestSellers={bestSellers} discounted={discounted} banners={banners} />;
}
