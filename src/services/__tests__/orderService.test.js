import { orderService } from '@/services/orderService';
import prisma from '@/lib/prisma';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    }
  }
}));

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process discount code correctly within a transaction', async () => {
    const mockOrderData = { customer: 'Test User', discountCode: 'INDIRIM10' };
    const mockItems = [{ productId: 1, quantity: 2 }];

    // Fake transaction implementation to run the callback
    prisma.$transaction.mockImplementation(async (cb) => {
      // Create a mock tx object that maps to the global prisma mock
      const tx = prisma;
      tx.product.findUnique.mockResolvedValue({ id: 1, ad: 'Test Product', fiyat: 100, stok: 10 });
      tx.order.create.mockResolvedValue({ id: 1, customer: 'Test User', total: 180 });
      tx.order.findUnique.mockResolvedValue({ id: 1, items: [] });
      return await cb(tx);
    });

    const result = await orderService.createOrder(mockOrderData, mockItems);
    
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    
    // Total should be 200 - 10% = 180
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        total: 180,
      })
    });
  });
});
