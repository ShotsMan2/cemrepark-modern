import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * Strategy Interface for Recommendation Engines
 * Abstracting this allows us to swap the underlying logic (e.g., Rule-based vs. ML model)
 * without changing the service consumers.
 */
class RecommendationStrategy {
  /**
   * @param {number} userId - The ID of the user.
   * @param {number} limit - The maximum number of recommended products to return.
   * @returns {Promise<Array>} List of recommended products.
   */
  async getRecommendations(userId, limit = 5) {
    throw new Error("Method 'getRecommendations()' must be implemented.");
  }
}

/**
 * Rule-Based Recommendation Engine
 * Recommends products based on the categories of a user's recent orders.
 */
export class RuleBasedRecommendationEngine extends RecommendationStrategy {
  async getRecommendations(userId, limit = 5) {
    try {
      // 1. Fetch recent orders for the user
      const recentOrders = await prisma.order.findMany({
        where: { userId: parseInt(userId, 10) },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!recentOrders || recentOrders.length === 0) {
        // Fallback: Return some default or popular products if no order history
        return await this._getFallbackProducts(limit);
      }

      // 2. Extract categories and product IDs to exclude already purchased products
      const purchasedProductIds = new Set();
      const categories = new Set();

      for (const order of recentOrders) {
        for (const item of order.items) {
          if (item.product) {
            purchasedProductIds.add(item.product.id);
            if (item.product.kategori) {
              categories.add(item.product.kategori);
            }
          }
        }
      }

      const categoryList = Array.from(categories);

      if (categoryList.length === 0) {
        return await this._getFallbackProducts(limit, Array.from(purchasedProductIds));
      }

      // 3. Return related products based on extracted categories, excluding already bought items
      const relatedProducts = await prisma.product.findMany({
        where: {
          kategori: { in: categoryList },
          id: { notIn: Array.from(purchasedProductIds) },
        },
        take: limit,
      });

      // 4. Pad with fallback products if we don't have enough recommendations
      if (relatedProducts.length < limit) {
        const excludeIds = [
          ...Array.from(purchasedProductIds),
          ...relatedProducts.map((p) => p.id),
        ];
        const fallback = await this._getFallbackProducts(
          limit - relatedProducts.length,
          excludeIds
        );
        return [...relatedProducts, ...fallback];
      }

      return relatedProducts;
    } catch (error) {
      logger.error("Error in RuleBasedRecommendationEngine", {
        error: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  async _getFallbackProducts(limit, excludeIds = []) {
    try {
      return await prisma.product.findMany({
        where: {
          id: { notIn: excludeIds },
        },
        take: limit,
      });
    } catch (error) {
      logger.error("Error fetching fallback products", { error: error.message });
      return [];
    }
  }
}

/**
 * Machine Learning Recommendation Engine (Placeholder)
 * This class serves as an abstraction for a future ML model integration.
 */
export class MLRecommendationEngine extends RecommendationStrategy {
  async getRecommendations(userId, limit = 5) {
    logger.info(`Fetching ML recommendations for user ${userId}`);
    // Example future implementation:
    // 1. Call external ML API or microservice: await fetch('http://ml-service/recommend?user_id=' + userId)
    // 2. Extract product IDs from the response
    // 3. Query Prisma for those specific product IDs
    return [];
  }
}

/**
 * Context Service for Recommendations
 * Uses the strategy pattern to allow dynamic swapping of the recommendation engine.
 */
class RecommendationService {
  constructor(strategy) {
    this.strategy = strategy;
  }

  /**
   * Dynamically change the recommendation strategy.
   * @param {RecommendationStrategy} strategy
   */
  setStrategy(strategy) {
    if (!(strategy instanceof RecommendationStrategy)) {
      throw new Error("Invalid strategy. Must be an instance of RecommendationStrategy.");
    }
    this.strategy = strategy;
  }

  /**
   * Get recommendations using the current strategy.
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getRecommendationsForUser(userId, limit = 5) {
    if (!this.strategy) {
      throw new Error("RecommendationStrategy is not set");
    }
    return await this.strategy.getRecommendations(userId, limit);
  }
}

// By default, instantiate the service with the Rule-Based engine.
export const recommendationService = new RecommendationService(new RuleBasedRecommendationEngine());
