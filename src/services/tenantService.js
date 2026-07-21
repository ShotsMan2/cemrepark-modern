import logger from "../lib/logger";

export class TenantService {
  /**
   * Resolves the current tenant (Store) based on the incoming request.
   * In a SaaS architecture, this typically looks at the "Host" header or a specific subdomain.
   * @param {Request} req
   * @returns {string} tenantId
   */
  static resolveTenant(req) {
    // For demonstration, we assume a custom header or fallback to a default 'cemrepark-master' tenant
    const host = req.headers.get("host") || "";
    const tenantId = req.headers.get("x-tenant-id") || host.split(".")[0];

    if (!tenantId || tenantId === "localhost" || tenantId === "www") {
      return "cemrepark-master";
    }

    logger.info(`[SaaS Architecture] Resolved Tenant: ${tenantId}`);
    return tenantId;
  }

  /**
   * Generates Prisma query extensions to isolate data per tenant.
   * Every database query must spread this where clause to prevent data leakage between stores.
   * @param {string} tenantId
   */
  static getTenantScope(tenantId) {
    // In a real SaaS with Prisma, we would add 'storeId' to Models
    // and use Prisma Client Extensions (Row Level Security simulation).
    // return { storeId: tenantId };
    return {}; // Placeholder for the actual DB implementation
  }
}
