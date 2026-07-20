import prisma from "../lib/prisma";
import logger from "../lib/logger";

class SearchAdapter {
  async searchProducts(query) {
    throw new Error("searchProducts must be implemented");
  }
}

export class SqliteFuzzySearchAdapter extends SearchAdapter {
  async searchProducts(query) {
    logger.info(`[SearchAdapter] Executing fuzzy search for: ${query}`);
    // Simulate fuzzy search using SQLite LIKE.
    // In a real scenario, this would be replaced by MeiliSearchAdapter
    const products = await prisma.product.findMany({
      where: {
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
      take: 20,
    });
    return products;
  }
}

export class MeiliSearchAdapter extends SearchAdapter {
  constructor() {
    super();
    // this.client = new MeiliSearch({ host: 'http://127.0.0.1:7700', apiKey: 'masterKey' });
  }

  async searchProducts(query) {
    logger.info(`[SearchAdapter] Executing MeiliSearch for: ${query}`);
    // const index = this.client.index('products');
    // const search = await index.search(query);
    // return search.hits;
    return [];
  }
}

export const searchService = new SqliteFuzzySearchAdapter();
