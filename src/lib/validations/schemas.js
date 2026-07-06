import { z } from 'zod';

export const userRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const orderCreateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be positive"),
  })).min(1, "Order must contain at least one item"),
  shippingAddress: z.string().min(10, "Shipping address is too short"),
});

export const productCreateSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than zero"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
});
