import eventBus, { EVENTS } from "./eventBus";
import logger from "./logger";
// Mock import of emailService. In a real app, import { sendOrderConfirmationEmail } from '../services/emailService';

function sendOrderConfirmationEmail(order) {
  // Simulating async email send
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info(`[Email Service] Order confirmation sent for Order ID: ${order.id}`);
      resolve();
    }, 1000);
  });
}

eventBus.on(EVENTS.ORDER_PLACED, async (order) => {
  try {
    logger.info(`[Event Listener] Processing ORDER_PLACED event for Order ID: ${order.id}`);
    await sendOrderConfirmationEmail(order);
  } catch (error) {
    logger.error(
      `[Event Listener] Failed to process ORDER_PLACED for Order ID: ${order.id}`,
      error
    );
  }
});

logger.info("[Event Listener] Order listeners initialized.");
