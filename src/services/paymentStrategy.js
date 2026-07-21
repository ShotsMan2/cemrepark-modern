/**
 * Base Payment Strategy Interface
 */
class PaymentStrategy {
  constructor() {
    if (this.constructor === PaymentStrategy) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  async pay(amount, currency, options = {}) {
    throw new Error("Method 'pay()' must be implemented.");
  }
}

/**
 * Concrete Strategy: Iyzico Payment
 */
class IyzicoPaymentStrategy extends PaymentStrategy {
  async pay(amount, currency, options = {}) {
    console.log(`[Iyzico] Processing payment of ${amount} ${currency}...`);
    // Mocking a successful payment response
    return {
      success: true,
      transactionId: `iyzico_${Math.random().toString(36).substr(2, 9)}`,
      method: "iyzico",
      message: "Payment processed successfully via Iyzico.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Concrete Strategy: Cash on Delivery
 */
class CashOnDeliveryStrategy extends PaymentStrategy {
  async pay(amount, currency, options = {}) {
    console.log(`[Cash On Delivery] Registering payment of ${amount} ${currency}...`);
    // Mocking a successful payment registration
    return {
      success: true,
      transactionId: `cod_${Math.random().toString(36).substr(2, 9)}`,
      method: "cash_on_delivery",
      message: "Order registered for cash on delivery.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Factory to get the appropriate payment strategy
 */
function getPaymentStrategy(method) {
  switch (method) {
    case "iyzico":
      return new IyzicoPaymentStrategy();
    case "cash_on_delivery":
      return new CashOnDeliveryStrategy();
    default:
      throw new Error(`Unsupported payment method: ${method}`);
  }
}

export { PaymentStrategy, IyzicoPaymentStrategy, CashOnDeliveryStrategy, getPaymentStrategy };
