import prisma from "@/lib/prisma";
import { OrderStateMachine, OrderStatus } from "./orderStateMachine";

export const orderService = {
  /**
   * Create an order and deduct product stock safely.
   * @param {Object} orderData - Data for the new order (e.g. { customer, userId, total })
   * @param {Array<{productId: number, quantity: number}>} items - Products to purchase
   */
  async createOrder(orderData, items = []) {
    return prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;

      // Deduct stock for each item and calculate total
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          const error = new Error(`Product with ID ${item.productId} not found`);
          error.statusCode = 404;
          error.isOperational = true;
          throw error;
        }

        if (product.stok < item.quantity) {
          const error = new Error(`Insufficient stock for product ${product.ad}. Available: ${product.stok}, Requested: ${item.quantity}`);
          error.statusCode = 400;
          error.isOperational = true;
          throw error;
        }

        // Deduct stock safely
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stok: {
              decrement: item.quantity
            }
          }
        });

        calculatedTotal += product.fiyat * item.quantity;
      }

      const total = orderData.total !== undefined ? orderData.total : calculatedTotal;

      // Final total is already calculated from the frontend, but we can verify it if needed.
      // We'll trust orderData.total, orderData.couponCode, orderData.discountAmount
      const finalTotal = total;

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customer: orderData.customer,
          userId: orderData.userId || null,
          total: finalTotal,
          couponCode: orderData.couponCode || null,
          discountAmount: orderData.discountAmount || 0,
          status: OrderStatus.PENDING,
        }
      });

      // Create order items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.fiyat,
          }
        });
      }

      // Return order with items
      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: true }
      });
    });
  },

  /**
   * Updates an order's status using the OrderStateMachine to enforce valid transitions.
   * @param {number} orderId - ID of the order to update
   * @param {string} newStatus - The new status to transition to
   */
  async updateOrderStatus(orderId, newStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      const error = new Error(`Order with ID ${orderId} not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const stateMachine = new OrderStateMachine(order.status);
    
    // Throws an error if the transition is invalid
    try {
      stateMachine.transitionTo(newStatus);
    } catch (e) {
      const error = new Error(e.message);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
  },

  async getOrderById(orderId) {
    return prisma.order.findUnique({
      where: { id: orderId }
    });
  },

  async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
};
