import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { OrderStateMachine, OrderStatus } from "./orderStateMachine";
import { sendEmail } from "@/lib/email";

let orderCounter = 0;
const getOrderNumber = () => {
  orderCounter++;
  const date = new Date();
  const prefix = `CP${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `${prefix}-${String(orderCounter).padStart(6, "0")}`;
};

async function sendOrderNotification(order, type) {
  try {
    const templates = {
      created: { subject: "Sipariş Onayı", text: `Siparişiniz #${order.orderNumber} alınmıştır.` },
      shipped: { subject: "Sipariş Kargolandı", text: `Siparişiniz #${order.orderNumber} kargoya verilmiştir.` },
      delivered: { subject: "Sipariş Teslim Edildi", text: `Siparişiniz #${order.orderNumber} teslim edilmiştir.` },
      cancelled: { subject: "Sipariş İptal Edildi", text: `Siparişiniz #${order.orderNumber} iptal edilmiştir.` },
      refunded: { subject: "İade İşlemi", text: `Siparişiniz #${order.orderNumber} için iade işlemi başlatılmıştır.` },
    };
    const template = templates[type];
    if (!template) return;

    await sendEmail(
      order.customer,
      template.subject,
      `<h2>${template.subject}</h2><p>${template.text}</p><p>Toplam: ${order.total} TL</p>`,
      template.text
    );
  } catch (error) {
    logger.error(`Failed to send ${type} notification for order ${order.id}`, { error: error.message });
  }
}

/**
 * @typedef {Object} OrderInputData
 * @property {string} customer
 * @property {number} [userId]
 * @property {number} [total]
 * @property {string} [couponCode]
 * @property {number} [discountAmount]
 * @property {string} [trackingNumber]
 * @property {string} [carrier]
 * @property {string} [paymentMethod]
 * @property {number} [shippingAddressId]
 * @property {number} [billingAddressId]
 */

/**
 * @typedef {Object} OrderItemInput
 * @property {number} productId
 * @property {number} quantity
 */

/**
 * @typedef {Object} PaginatedOrderResult
 * @property {Array} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

/**
 * @typedef {Object} OrderFilters
 * @property {string} [search]
 * @property {string} [status]
 */

export const orderService = {
  /**
   * @param {OrderInputData} orderData
   * @param {OrderItemInput[]} [items=[]]
   * @returns {Promise<Object>}
   */
  async createOrder(orderData, items = []) {
    return prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          const error = new Error(`Product with ID ${item.productId} not found`);
          error.statusCode = 404;
          error.isOperational = true;
          throw error;
        }

        if (product.stok < item.quantity) {
          const error = new Error(
            `Insufficient stock for product ${product.ad}. Available: ${product.stok}, Requested: ${item.quantity}`
          );
          error.statusCode = 400;
          error.isOperational = true;
          throw error;
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stok: { decrement: item.quantity } },
        });

        calculatedTotal += product.fiyat * item.quantity;
      }

      const total = orderData.total !== undefined ? orderData.total : calculatedTotal;
      const finalTotal = total;
      const orderNumber = getOrderNumber();

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customer: orderData.customer,
          userId: orderData.userId || null,
          total: finalTotal,
          couponCode: orderData.couponCode || null,
          discountAmount: orderData.discountAmount || 0,
          status: OrderStatus.PENDING,
          paymentStatus: "PENDING",
          paymentMethod: orderData.paymentMethod || null,
          shippingAddressId: orderData.shippingAddressId || null,
          billingAddressId: orderData.billingAddressId || null,
        },
      });

      const orderItemsData = items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          price: product.fiyat,
        };
      });

      await tx.orderItem.createMany({ data: orderItemsData });

      const provider = orderData.paymentMethod || "unknown";
      await tx.paymentTransaction.create({
        data: {
          orderId: newOrder.id,
          provider,
          amount: finalTotal,
          status: "PENDING",
        },
      });

      const order = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: true },
      });

      sendOrderNotification(order, "created");
      return order;
    });
  },

  async updateOrderStatus(orderId, newStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      const error = new Error(`Order with ID ${orderId} not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const stateMachine = new OrderStateMachine(order.status);
    try {
      stateMachine.transitionTo(newStatus);
    } catch (e) {
      const error = new Error(e.message);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const isCancelledOrReturned = newStatus === "CANCELLED" || newStatus === "İptal Edildi";
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentStatus: newStatus === "CANCELLED" ? "REFUNDED" : order.paymentStatus,
        },
        include: { items: true },
      });

      if (isCancelledOrReturned && updated.items) {
        for (const item of updated.items) {
          try {
            await tx.product.update({
              where: { id: item.productId },
              data: { stok: { increment: item.quantity } },
            });
          } catch (e) {
            logger.error(`Failed to restore stock for product ${item.productId}:`, e);
          }
        }
      }

      return updated;
    });

    const notificationType = newStatus === "CANCELLED" ? "cancelled" : newStatus.toLowerCase();
    sendOrderNotification(updatedOrder, notificationType);

    return updatedOrder;
  },

  async processRefund(orderId, amount) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        const error = new Error(`Order with ID ${orderId} not found`);
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }

      if (order.paymentStatus === "REFUNDED") {
        const error = new Error("Order has already been refunded");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      const refundAmount = amount || order.total;
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: "REFUNDED", status: "İade Edildi" },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId,
          provider: order.paymentMethod || "unknown",
          amount: -refundAmount,
          status: "REFUNDED",
        },
      });

      if (order.items) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stok: { increment: item.quantity } },
          });
        }
      }

      sendOrderNotification(order, "refunded");
      return { success: true, refundAmount };
    });
  },

  async getOrderById(orderId) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, paymentTransactions: true },
    });
  },

  async getOrderByNumber(orderNumber) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: { items: { include: { product: true } }, paymentTransactions: true },
    });
  },

  async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, paymentTransactions: true },
    });
  },

  async getOrdersPaginated(filters = {}, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") {
    try {
      const { search, status, paymentStatus, startDate, endDate, customer } = filters;
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { customer: { contains: search } },
          { orderNumber: { contains: search } },
          { trackingNumber: { contains: search } },
        ];
      }

      if (status && status !== "all") {
        whereClause.status = status;
      }

      if (paymentStatus && paymentStatus !== "all") {
        whereClause.paymentStatus = paymentStatus;
      }

      if (customer) {
        whereClause.customer = { contains: customer };
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
          include: { items: true, paymentTransactions: true },
        }),
        prisma.order.count({ where: whereClause }),
      ]);

      return {
        data: orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Failed to fetch paginated orders from DB", { error: error.message });
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  },

  async getOrdersAggregation() {
    try {
      const [totalOrders, totalRevenue, statusDistribution, paymentDistribution] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.groupBy({
          by: ["status"],
          _count: { _all: true },
          _sum: { total: true },
        }),
        prisma.order.groupBy({
          by: ["paymentStatus"],
          _count: { _all: true },
        }),
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        statusDistribution: statusDistribution.map(s => ({
          status: s.status,
          count: s._count._all,
          total: s._sum.total || 0,
        })),
        paymentDistribution: paymentDistribution.map(p => ({
          status: p.paymentStatus,
          count: p._count._all,
        })),
      };
    } catch (error) {
      logger.error("Failed to aggregate orders", { error: error.message });
      return {
        totalOrders: 0,
        totalRevenue: 0,
        statusDistribution: [],
        paymentDistribution: [],
      };
    }
  },

  async updatePaymentStatus(orderId, paymentStatus, transactionId) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId,
          provider: order.paymentMethod || "unknown",
          amount: order.total,
          status: paymentStatus,
          transactionId: transactionId || null,
        },
      });

      return order;
    });
  },
};
