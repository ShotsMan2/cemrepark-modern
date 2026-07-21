export interface ShippingRateRequest {
  originZip?: string;
  destinationZip?: string;
  destinationCity?: string;
  weight: number; // in kg
  volume?: number; // in cm3 or m3
}

export interface ShippingRateResponse {
  providerName: string;
  cost: number;
  currency: string;
  estimatedDays?: number;
}

export interface TrackingRequest {
  orderId: string;
  shippingAddress?: any;
  customerInfo?: any;
}

export interface TrackingResponse {
  trackingCode: string;
  trackingUrl: string;
}

export interface IShippingProvider {
  calculateShippingCost(request: ShippingRateRequest): Promise<ShippingRateResponse>;
  generateTrackingCode(request: TrackingRequest): Promise<TrackingResponse>;
  getProviderName(): string;
}
