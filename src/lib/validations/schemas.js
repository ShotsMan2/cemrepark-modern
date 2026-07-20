const z = require("zod");

const orderCreateSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  userId: z.number().int().positive().optional().nullable(),
  total: z.number().min(0, "Total must be non-negative").optional(),
  items: z.array(z.object({
    productId: z.number().int().positive("Product ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    price: z.number().min(0, "Price must be non-negative"),
    variantId: z.number().int().positive().optional().nullable(),
  })).min(1, "Order must contain at least one item"),
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().min(0).optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  shippingAddressId: z.number().int().positive().optional().nullable(),
  billingAddressId: z.number().int().positive().optional().nullable(),
  carrier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const orderUpdateSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  trackingNumber: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const productCreateSchema = z.object({
  ad: z.string().min(1, "Product name is required"),
  fiyat: z.number().min(0, "Price must be non-negative"),
  kategori: z.string().optional().nullable(),
  resim: z.string().optional().nullable(),
  gorsel: z.string().optional().nullable(),
  etiket: z.string().optional().nullable(),
  renk: z.string().optional().nullable(),
  beden: z.string().optional().nullable(),
  stok: z.number().int().min(0, "Stock cannot be negative").optional().default(0),
  categoryId: z.number().int().positive().optional().nullable(),
  variants: z.array(z.object({
    sku: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
    stock: z.number().int().min(0).default(0),
    price: z.number().min(0).optional().nullable(),
  })).optional(),
  colors: z.array(z.object({
    renkAdi: z.string().min(1, "Color name is required"),
    gorselUrl: z.string().min(1, "Color image URL is required"),
  })).optional(),
});

const productUpdateSchema = z.object({
  ad: z.string().min(1).optional(),
  fiyat: z.number().min(0).optional(),
  kategori: z.string().optional().nullable(),
  resim: z.string().optional().nullable(),
  gorsel: z.string().optional().nullable(),
  etiket: z.string().optional().nullable(),
  renk: z.string().optional().nullable(),
  beden: z.string().optional().nullable(),
  stok: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
});

const couponCreateSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0, "Discount value must be non-negative"),
  minCartValue: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const couponValidateSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  cartTotal: z.number().min(0, "Cart total must be non-negative"),
});

const bannerCreateSchema = z.object({
  title: z.string().min(1, "Banner title is required"),
  imageUrl: z.string().url("Invalid image URL"),
  linkUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

const bannerUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

const pageCreateSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const pageUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

const settingsUpdateSchema = z.record(z.string(), z.any());

const userProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phoneNumber: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

const messageCreateSchema = z.object({
  adSoyad: z.string().min(1, "Name is required"),
  telefon: z.string().optional().nullable(),
  email: z.string().email("Invalid email address"),
  mesaj: z.string().min(1, "Message is required"),
});

const reviewCreateSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required"),
});

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
  status: z.enum(["APPROVED", "PENDING", "REJECTED"]).optional(),
});

const shippingMethodCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  price: z.number().min(0, "Price must be non-negative"),
  freeAbove: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  estimatedDays: z.number().int().positive().optional().nullable(),
});

const shippingMethodUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  provider: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  freeAbove: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  estimatedDays: z.number().int().positive().optional().nullable(),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  orderCreateSchema,
  orderUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  couponCreateSchema,
  couponValidateSchema,
  bannerCreateSchema,
  bannerUpdateSchema,
  pageCreateSchema,
  pageUpdateSchema,
  settingsUpdateSchema,
  userProfileUpdateSchema,
  messageCreateSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  shippingMethodCreateSchema,
  shippingMethodUpdateSchema,
  registerSchema,
  loginSchema,
};
