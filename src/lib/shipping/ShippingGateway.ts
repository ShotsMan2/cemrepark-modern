import { IShippingProvider } from "./IShippingProvider";
import { YurticiProvider } from "./providers/YurticiProvider";
import { ArasProvider } from "./providers/ArasProvider";

export type ShippingProviderType = "YURTICI" | "ARAS";

export class ShippingGateway {
  private static providers: Map<ShippingProviderType, IShippingProvider> = new Map();

  static {
    ShippingGateway.providers.set("YURTICI", new YurticiProvider());
    ShippingGateway.providers.set("ARAS", new ArasProvider());
  }

  static getProvider(type: ShippingProviderType): IShippingProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Shipping provider ${type} is not supported.`);
    }
    return provider;
  }

  static getAllProviders(): IShippingProvider[] {
    return Array.from(this.providers.values());
  }
}
