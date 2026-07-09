import prisma from "@/lib/prisma";

/**
 * Aggregates sales data over time.
 * Groups by date to avoid pulling all orders into memory.
 */
export async function getSalesOverTime() {
  // Using raw SQL for date extraction since Prisma groupBy doesn't natively support Date formatting (like DAY/MONTH) out-of-the-box for SQLite.
  // This calculates sales and order count grouped by day.
  const salesOverTime = await prisma.$queryRaw`
    SELECT 
      date(createdAt) as date, 
      SUM(total) as totalSales, 
      COUNT(id) as orderCount
    FROM "Order"
    WHERE status != 'cancelled'
    GROUP BY date(createdAt)
    ORDER BY date(createdAt) ASC
  `;

  // SQLite returns BigInt for counts which can throw JSON serialization errors.
  // Converting them safely for the frontend response.
  return salesOverTime.map(item => ({
    date: item.date,
    totalSales: Number(item.totalSales),
    orderCount: Number(item.orderCount)
  }));
}

/**
 * Aggregates top products based on review counts and average rating.
 * Uses Prisma's native groupBy.
 */
export async function getTopProducts(limit = 5) {
  const topReviews = await prisma.review.groupBy({
    by: ['productId'],
    _count: {
      id: true,
    },
    _avg: {
      rating: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });

  if (!topReviews || topReviews.length === 0) {
    return [];
  }

  // Fetch the actual product details for the top product IDs
  const productIds = topReviews.map((r) => r.productId);
  
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      ad: true,
      fiyat: true,
      gorsel: true,
    }
  });

  // Merge the aggregated data with product details
  return topReviews.map(review => ({
    ...review,
    product: products.find(p => p.id === review.productId) || null
  }));
}

export const dashboardService = {
  getSalesOverTime,
  getTopProducts
};

export default dashboardService;
