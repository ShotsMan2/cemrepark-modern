import {
  IShippingProvider,
  ShippingRateRequest,
  ShippingRateResponse,
  TrackingRequest,
  TrackingResponse,
} from "../IShippingProvider";

export class ArasProvider implements IShippingProvider {
  async calculateShippingCost(request: ShippingRateRequest): Promise<ShippingRateResponse> {
    // Mock API call to Aras Kargo
    const baseRate = 30.0;
    const weightRate = (request.weight || 1) * 6.0;
    const cost = baseRate + weightRate;

    return {
      providerName: "Aras Kargo",
      cost,
      currency: "TRY",
      estimatedDays: 2,
    };
  }

  async generateTrackingCode(request: TrackingRequest): Promise<TrackingResponse> {
    // Mock tracking generation
    const trackingCode = `ARAS-${request.orderId}-${Date.now()}`;
    return {
      trackingCode,
      trackingUrl: `https://www.araskargo.com.tr/tr/gonderi-takibi?code=${trackingCode}`,
    };
  }

  getProviderName(): string {
    return "Aras Kargo";
  }
}
