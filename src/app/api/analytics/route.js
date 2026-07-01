import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const productsCount = await prisma.product.count();
    const ordersCount = await prisma.order.count();
    
    // Users are sometimes customers, or maybe we count users with role="user", wait, let's just count users
    const usersCount = await prisma.user.count();

    const orders = await prisma.order.findMany({
      select: { total: true }
    });

    const categoriesCount = await prisma.category.count();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      products: productsCount,
      orders: ordersCount,
      users: usersCount,
      categories: categoriesCount,
      revenue: totalRevenue
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
