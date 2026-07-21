import { IPaymentProvider } from "./types";
import { IyzicoProvider } from "./providers/IyzicoProvider";
import { StripeProvider } from "./providers/StripeProvider";

export type PaymentProviderType = "iyzico" | "stripe";

export class PaymentGateway {
  static getProvider(providerName: PaymentProviderType): IPaymentProvider {
    switch (providerName) {
      case "iyzico":
        // In a real scenario, credentials should come from environment variables
        return new IyzicoProvider(
          process.env.IYZICO_API_KEY || "dummy_api_key",
          process.env.IYZICO_SECRET_KEY || "dummy_secret_key",
          process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"
        );

      case "stripe":
        return new StripeProvider(process.env.STRIPE_SECRET_KEY || "dummy_stripe_secret_key");

      default:
        throw new Error(`Payment provider ${providerName} is not supported.`);
    }
  }
}
