import {
  IShippingProvider,
  ShippingRateRequest,
  ShippingRateResponse,
  TrackingRequest,
  TrackingResponse,
} from "../IShippingProvider";

export class YurticiProvider implements IShippingProvider {
  async calculateShippingCost(request: ShippingRateRequest): Promise<ShippingRateResponse> {
    // Mock API call to Yurtiçi Kargo
    const baseRate = 35.0;
    const weightRate = (request.weight || 1) * 5.0;
    const cost = baseRate + weightRate;

    return {
      providerName: "Yurtici Kargo",
      cost,
      currency: "TRY",
      estimatedDays: 2,
    };
  }

  async generateTrackingCode(request: TrackingRequest): Promise<TrackingResponse> {
    // Mock tracking generation
    const trackingCode = `YK-${request.orderId}-${Date.now()}`;
    return {
      trackingCode,
      trackingUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingCode}`,
    };
  }

  getProviderName(): string {
    return "Yurtici Kargo";
  }
}
