import { logger } from '@/lib/logger';
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_development",
    });

    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create CSV content
    const csvHeader = "ID,Müşteri,Tutar,Durum,Tarih,Ürünler\n";
    const csvRows = orders.map((order) => {
      const itemsList = order.items
        .map((item) => `${item.product?.ad || "Bilinmeyen Ürün"} (x${item.quantity})`)
        .join(" | ");

      // Escape quotes and commas in CSV
      const escapeCsv = (str: any) => `"${String(str).replace(/"/g, '""')}"`;

      return `${order.id},${escapeCsv(order.customer)},${order.total},${escapeCsv(order.status)},${order.createdAt.toISOString()},${escapeCsv(itemsList)}`;
    });

    const csvContent = "\uFEFF" + csvHeader + csvRows.join("\n"); // Add BOM for UTF-8 Excel support

    const response = new NextResponse(csvContent);
    response.headers.set("Content-Type", "text/csv; charset=utf-8");
    response.headers.set("Content-Disposition", 'attachment; filename="orders_export.csv"');

    return response;
  } catch (error) {
    logger.error("Export orders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
