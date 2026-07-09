import prisma from "@/lib/prisma";

class AnalyticsService {
  async getAnalytics() {
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

    return {
      products: productsCount,
      orders: ordersCount,
      users: usersCount,
      categories: categoriesCount,
      revenue: totalRevenue,
      usersByRole,
      salesOverTime
    };
  }
}

export const analyticsService = new AnalyticsService();
