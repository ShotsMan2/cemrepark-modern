import prisma from "@/lib/prisma";
import redis from "@/lib/redis";
import logger from "@/lib/logger";

class AnalyticsService {
  async getAnalytics() {
    const cacheKey = "admin:analytics:dashboard:v4";
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (err) {
      logger.error("Redis get error in analytics:", err.message);
    }

    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        logger.error("Redis parse error:", error);
      }
    }

    const [
      productsCount,
      ordersCount,
      usersCount,
      categoriesCount,
      revenueAggregation,
      usersByRole,
      recentOrders,
      categoriesGroup,
      logins,
      orderStatuses,
      topSelling,
      recentUsers,
      recentLoginHistory,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.category.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      this.getRecentOrders(),
      prisma.product.groupBy({
        by: ["kategori"],
        _count: { _all: true },
      }),
      prisma.loginHistory.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      this.getTopSellingProducts(),
      this.getRecentUsers(),
      this.getLoginTimeline(),
    ]);

    const totalRevenue = revenueAggregation._sum.total || 0;

    const usersRoleData = usersByRole.map((u) => ({
      name: u.role,
      value: u._count._all,
    }));

    const categoryData = categoriesGroup.map((c) => ({
      name: c.kategori || "Bilinmeyen",
      value: c._count._all,
    }));

    const loginStats = logins.map((l) => ({
      name: l.status === "SUCCESS" ? "Başarılı" : "Başarısız",
      value: l._count._all,
    }));

    const orderStats = orderStatuses.map((o) => ({
      name: o.status,
      value: o._count._all,
    }));

    const result = {
      products: productsCount,
      orders: ordersCount,
      users: usersCount,
      categories: categoriesCount,
      revenue: totalRevenue,
      usersByRole: usersRoleData,
      salesOverTime: recentOrders,
      categoryData,
      loginStats,
      orderStats,
      topSellingProducts: topSelling,
      userGrowth: recentUsers,
      loginTimeline: recentLoginHistory,
      comparison: await this.getComparisonPeriods(),
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
    } catch (err) {
      logger.error("Redis set error in analytics:", err.message);
    }

    return result;
  }

  async getRecentOrders() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: "asc" },
    });

    const salesMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      salesMap[dateStr] = { total: 0, orders: 0, date: dateStr };
    }

    orders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
      if (salesMap[dateStr]) {
        salesMap[dateStr].total += o.total;
        salesMap[dateStr].orders += 1;
      }
    });

    return Object.values(salesMap);
  }

  async getTopSellingProducts(limit = 5) {
    const topSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const topProductIds = topSelling.map((t) => t.productId);
    const topProductsDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, ad: true, fiyat: true },
    });

    return topSelling.map((t) => {
      const product = topProductsDetails.find((p) => p.id === t.productId);
      return {
        name: product ? product.ad : `Ürün ${t.productId}`,
        value: t._sum.quantity || 0,
        revenue: product ? (t._sum.quantity || 0) * product.fiyat : 0,
      };
    });
  }

  async getRecentUsers() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = { name: key, users: 0 };
    }

    users.forEach((u) => {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap[key]) monthMap[key].users += 1;
    });

    return Object.values(monthMap);
  }

  async getLoginTimeline(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logins = await prisma.loginHistory.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    const dayMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = { date: key, success: 0, failed: 0 };
    }

    logins.forEach((l) => {
      const key = new Date(l.createdAt).toISOString().split("T")[0];
      if (dayMap[key]) {
        if (l.status === "SUCCESS") dayMap[key].success += 1;
        else dayMap[key].failed += 1;
      }
    });

    return Object.values(dayMap);
  }

  async getTimeSeriesData(startDate, endDate, granularity = "day") {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const seriesMap = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (granularity === "day") {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split("T")[0];
        seriesMap[key] = { date: key, total: 0, orders: 0 };
      }
    } else if (granularity === "month") {
      const d = new Date(start);
      while (d <= end) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        seriesMap[key] = { date: key, total: 0, orders: 0 };
        d.setMonth(d.getMonth() + 1);
      }
    }

    orders.forEach((o) => {
      let key;
      if (granularity === "day") {
        key = new Date(o.createdAt).toISOString().split("T")[0];
      } else {
        const d = new Date(o.createdAt);
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      if (seriesMap[key]) {
        seriesMap[key].total += o.total;
        seriesMap[key].orders += 1;
      }
    });

    return Object.values(seriesMap);
  }

  async getComparisonPeriods() {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 29);
    currentStart.setHours(0, 0, 0, 0);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 30);
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);

    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: currentStart } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
        select: { total: true },
      }),
    ]);

    const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const [currentUsers, previousUsers] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: currentStart } } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      }),
    ]);
    const usersChange = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: Math.round(revenueChange * 100) / 100,
      },
      users: {
        current: currentUsers,
        previous: previousUsers,
        change: Math.round(usersChange * 100) / 100,
      },
      orders: {
        current: currentOrders.length,
        previous: previousOrders.length,
        change: previousOrders.length > 0
          ? Math.round(((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 * 100) / 100
          : 0,
      },
    };
  }

  async exportData(format = "json", startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const headers = "OrderID,OrderNumber,Customer,Total,Status,PaymentStatus,Date\n";
      const rows = orders.map((o) =>
        `${o.id},${o.orderNumber},${o.customer},${o.total},${o.status},${o.paymentStatus},${o.createdAt.toISOString()}`
      ).join("\n");
      return headers + rows;
    }

    return orders;
  }
}

export const analyticsService = new AnalyticsService();
