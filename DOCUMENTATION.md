# Cemre Park E-Commerce Platform Documentation

## 1. Project Overview & Architecture

**Purpose:**  
Cemre Park is a modern e-commerce platform designed for the fashion and hijab clothing sector. It provides a highly interactive customer-facing storefront and a comprehensive administration dashboard to manage store operations.

**Core Technologies:**
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript / JavaScript
*   **Database & ORM:** Prisma ORM, configured with SQLite for local development and PostgreSQL for production environments.
*   **Styling:** Tailwind CSS v4
*   **Authentication:** NextAuth.js (Credentials Provider)
*   **UI Libraries:** SweetAlert2 (alerts), Swiper (carousels/sliders), AOS (scroll animations), and Recharts (admin dashboard charts).
*   **Security:** `bcrypt` for secure password hashing.
*   **Infrastructure:** Docker & Docker Compose for containerized setups.

## 2. Directory Structure

The repository is structured around the Next.js App Router architecture:

*   **`src/app/`**: Core routing directory.
    *   **`(Storefront Routes)`**: Public pages like `/cart`, `/checkout`, `/favorites`, `/hesabim` (My Account), `/kurumsal` (Corporate), `/login`, `/register`, `/search`, and `/urundetay` (Product Details).
    *   **`admin/`**: Dedicated routes and views for the Admin dashboard.
    *   **`api/`**: Backend API endpoints.
*   **`src/components/`**: Reusable React UI components (e.g., `Header`, `Footer`, `ChatWidget`, `ProductCard`, `ContactForm`).
*   **`src/context/`**: React Context providers for global state management (e.g., `AuthProvider`).
*   **`src/data/`, `src/lib/`, `src/utils/`**: Static data, external library configurations, and helper/utility functions.
*   **`prisma/`**: Database schema definitions (`schema.prisma`) and local SQLite database (`dev.db`).
*   **`public/`**: Static public assets such as images, fonts, and icons.

## 3. Frontend Implementation

### UI & Styling
*   **Tailwind CSS v4:** Used extensively for utility-first styling. Global styles are defined in `src/app/globals.css`.
*   **Animations:** AOS (Animate On Scroll) is integrated for scroll animations, initialized via a custom `AOSInitializer` component.
*   **Components:** Modular components exist in `src/components/`. Critical structural components like `Header.js` and `Footer.js` manage navigation, while specialized components like `ChatWidget.js` provide interactive features.
*   **Responsiveness:** The layout is fully responsive, leveraging Tailwind's breakpoint system.

## 4. Backend & Database (Prisma)

### Data Models
The application relies on Prisma ORM. Key models defined in `prisma/schema.prisma` include:
*   **`User`**: Handles both customers and administrators. Includes authentication fields and relationships to orders and reviews.
*   **`Product` & `Category`**: Core catalog models. Products include stock, pricing, and variant details (color, size).
*   **`Order` & `OrderItem`**: E-commerce transaction management.
*   **`Banner` & `Page`**: Dynamic content management models for the homepage and corporate pages.
*   **`Message`**: Contact form submissions.
*   **`LoginHistory` & `AuditLog`**: Security and action tracking models.
*   **`ChatConversation` & `ChatMessage`**: State management for the integrated AI Chat Widget.

### API Endpoints
The `src/app/api/` directory serves as the backend, housing distinct modules:
*   `analytics/`, `auth/`, `banners/`, `messages/`, `orders/`, `products/`, `reviews/`, `settings/`, `users/`, `widget/`, etc.
*   These routes handle CRUD operations bridging the Next.js frontend with the database.

## 5. Authentication & Security

*   **NextAuth.js:** Configured in `src/app/api/auth/[...nextauth]/route.js`. The system uses a `CredentialsProvider` that authenticates against the Prisma `User` table using `bcrypt.compare`.
*   **Roles & Route Protection:**
    *   Role-Based Access Control (RBAC) is implemented. Users have roles (default: `user`, admin: `admin`).
    *   NextAuth Middleware (`src/middleware.js`) protects `/admin` routes (requiring the `admin` role) and user-specific routes like `/hesabim`.
*   **Audit Logging:** Administrative actions are logged into the `AuditLog` table, and successful logins are tracked in `LoginHistory`.

## 6. Deployment & Operations

### Dockerization
The project is containerized using Docker, allowing for reproducible builds.
*   **`Dockerfile`**: A multi-stage build process based on `node:20-alpine`. It leverages Next.js standalone output to reduce the final production image size.
*   **`docker-compose.yml`**: Configures the main `web` service and an optional `redis` service (future-proofing for distributed caching/rate-limiting).

### Local Setup
1.  Install dependencies: `npm install`
2.  Generate Prisma Client: `npx prisma generate`
3.  Run development server: `npm run dev`
4.  The application will be accessible at `http://localhost:3000`.
