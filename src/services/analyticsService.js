import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

class AnalyticsService {
  async getAnalytics() {
    const cacheKey = "admin:analytics:dashboard:v3";
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (err) {
      console.error("Redis get error in analytics:", err.message);
    }

    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        console.error("Redis parse error:", error);
      }
    }

    const productsCount = await prisma.product.count();
    const ordersCount = await prisma.order.count();
    const usersCount = await prisma.user.count();

    const categoriesCount = await prisma.category.count();

    const revenueAggregation = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const totalRevenue = revenueAggregation._sum.total || 0;

    // Users by Role
    const users = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        _all: true,
      },
    });

    const usersByRole = users.map((u) => ({
      name: u.role,
      value: u._count._all,
    }));

    // Sales over Time (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Initialize last 7 days
    const salesMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
      salesMap[dateStr] = { total: 0, orders: 0 };
    }

    recentOrders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("tr-TR", {
        month: "short",
        day: "numeric",
      });
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr].total += o.total;
        salesMap[dateStr].orders += 1;
      } else {
        salesMap[dateStr] = { total: o.total, orders: 1 };
      }
    });

    const salesOverTime = Object.keys(salesMap).map((date) => ({
      name: date,
      total: salesMap[date].total,
      orders: salesMap[date].orders,
    }));

    // Category distribution
    const categoriesGroup = await prisma.product.groupBy({
      by: ["kategori"],
      _count: { _all: true },
    });
    const categoryData = categoriesGroup.map((c) => ({
      name: c.kategori || "Bilinmeyen",
      value: c._count._all,
    }));

    // User Behavior (LoginHistory)
    const logins = await prisma.loginHistory.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const loginStats = logins.map((l) => ({
      name: l.status === "SUCCESS" ? "Başarılı" : "Başarısız",
      value: l._count._all,
    }));

    // Order status (to find cancelled/returned)
    const orderStatuses = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const orderStats = orderStatuses.map((o) => ({
      name: o.status,
      value: o._count._all,
    }));

    // Top Selling Products
    const topSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProductIds = topSelling.map((t) => t.productId);
    const topProductsDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, ad: true },
    });

    const topSellingProducts = topSelling.map((t) => {
      const product = topProductsDetails.find((p) => p.id === t.productId);
      return {
        name: product ? product.ad : `Ürün ${t.productId}`,
        value: t._sum.quantity || 0,
      };
    });

    // User Growth (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: { createdAt: true },
    });

    const userMonthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
      userMonthMap[monthStr] = 0;
    }

    recentUsers.forEach((u) => {
      const monthStr = new Date(u.createdAt).toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric",
      });
      if (userMonthMap[monthStr] !== undefined) {
        userMonthMap[monthStr] += 1;
      } else {
        userMonthMap[monthStr] = 1;
      }
    });

    const userGrowth = Object.keys(userMonthMap).map((month) => ({
      name: month,
      users: userMonthMap[month],
    }));

    const result = {
      products: productsCount,
      orders: ordersCount,
      users: usersCount,
      categories: categoriesCount,
      revenue: totalRevenue,
      usersByRole,
      salesOverTime,
      categoryData,
      loginStats,
      orderStats,
      topSellingProducts,
      userGrowth,
    };

    // Cache the result for 5 minutes (300 seconds)
    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
    } catch (err) {
      console.error("Redis set error in analytics:", err.message);
    }

    return result;
  }
}

export const analyticsService = new AnalyticsService();
