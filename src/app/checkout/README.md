# Checkout Flow Architecture

This directory contains the checkout flow pages for the Cemre Park E-Commerce Platform.
To improve conversion rates, we are migrating to a **One-Step Checkout** model.

## Overview

The goal of the one-step checkout is to reduce friction by displaying all necessary forms (shipping, billing, payment, and order summary) on a single responsive page.

## Key Components

1. **`src/app/checkout/page.tsx`**: The main page container. It handles the layout and protects the route (ensuring the user has items in their cart and optionally redirecting unauthenticated users to login, depending on guest checkout policies).
2. **`src/components/checkout/OneStepCheckout.tsx`**: The theoretical, unified component that orchestrates the entire process. It encapsulates:
   - **Address Collection**: Fetching saved addresses for logged-in users and validating inputs via Zod.
   - **Payment Gateway**: Handling tokenization and communication with the payment provider securely.
   - **Order Summary**: Displaying an immutable snapshot of the cart, total amount, shipping fees, and applied coupons.

## State Management

- **Local Form State**: Managed by `react-hook-form` and validated using `zod` for immediate, accessible feedback.
- **Global Context**: Reads from the `StoreContext` to get the latest cart items and sync quantities.

## API Endpoints Invoked

- `POST /api/orders`: Finalizes the order, decrements stock, and returns an `orderId`.
- `POST /api/coupons/validate`: Real-time validation if the user inputs a coupon during checkout.

## Future Enhancements

- Implementing robust error recovery mechanisms if the payment API fails but the internal order was temporarily generated.
- Guest Checkout support vs. strict Auth flows.
- Integrating localized payment solutions (e.g., Iyzico, PayTR).
