import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

class AnalyticsService {
  async getAnalytics() {
    const cacheKey = "admin:analytics:dashboard";
    const cachedData = await redis.get(cacheKey);

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

    const orders = await prisma.order.findMany({
      select: { total: true },
    });

    const categoriesCount = await prisma.category.count();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Users by Role
    const users = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });
    
    const usersByRole = users.map(u => ({
      name: u.role,
      value: u._count._all
    }));

    // Sales over Time (Mocking a bit since SQLite doesn't easily format dates in groupBy out-of-the-box via Prisma without raw queries)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    
    // Group by day
    const salesMap = {};
    recentOrders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
      salesMap[date] = (salesMap[date] || 0) + o.total;
    });
    
    const salesOverTime = Object.keys(salesMap).map(date => ({
      name: date,
      total: salesMap[date]
    }));

    // Category distribution
    const categoriesGroup = await prisma.product.groupBy({
      by: ['kategori'],
      _count: { _all: true }
    });
    const categoryData = categoriesGroup.map(c => ({
      name: c.kategori || "Bilinmeyen",
      value: c._count._all
    }));

    // User Behavior (LoginHistory)
    const logins = await prisma.loginHistory.groupBy({
      by: ['success'],
      _count: { _all: true }
    });
    const loginStats = logins.map(l => ({
      name: l.success ? "Başarılı" : "Başarısız",
      value: l._count._all
    }));

    // Order status (to find cancelled/returned)
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    const orderStats = orderStatuses.map(o => ({
      name: o.status,
      value: o._count._all
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
      orderStats
    };

    // Cache the result for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

    return result;
  }
}

export const analyticsService = new AnalyticsService();
