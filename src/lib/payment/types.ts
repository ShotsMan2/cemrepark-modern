export interface PaymentInitializeRequest {
  orderId: string;
  amount: number;
  currency: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    ip: string;
    registrationAddress: string;
    city: string;
    country: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: number;
  }>;
}

export interface PaymentInitializeResponse {
  status: 'success' | 'failure';
  paymentPageUrl?: string; // For hosted checkout pages
  token?: string; // For 3D secure or specific flows
  errorMessage?: string;
  errorCode?: string;
  htmlContent?: string; // For embedded checkout
}

export interface PaymentVerifyRequest {
  token: string;
  paymentId?: string;
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failure';
  paymentId?: string;
  amount?: number;
  currency?: string;
  errorMessage?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  currency: string;
  reason?: string;
}

export interface RefundResponse {
  status: 'success' | 'failure';
  refundId?: string;
  errorMessage?: string;
}

export interface IPaymentProvider {
  /**
   * Initializes a payment flow, potentially returning a URL for hosted checkout
   * or a token for client-side completion.
   */
  initializePayment(request: PaymentInitializeRequest): Promise<PaymentInitializeResponse>;

  /**
   * Verifies a payment after the user returns from a checkout flow.
   */
  verifyPayment(request: PaymentVerifyRequest): Promise<PaymentVerifyResponse>;

  /**
   * Refunds a captured payment.
   */
  refundPayment(request: RefundRequest): Promise<RefundResponse>;
}
