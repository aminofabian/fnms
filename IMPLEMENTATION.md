# FnM's Mini Mart - Implementation Roadmap

> Step-by-step guide to building the grocery ecommerce platform from start to finish.

---

## How to Use This Document

- Work through steps **in order** - later steps depend on earlier ones
- Check off items as you complete them `[x]`
- Each section includes estimated complexity: 🟢 Easy | 🟡 Medium | 🔴 Complex
- Don't skip the foundation steps - they save time later

---

## Phase 1: Foundation & Setup

### Step 1: Project Configuration 🟢

**Goal:** Set up the development environment and project structure.

- [ ] **1.1** Initialize Git repository (if not done)
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```

- [ ] **1.2** Set up environment variables
  - [ ] Create `.env.local` file
  - [ ] Create `.env.example` with placeholder values
  - [ ] Add `.env.local` to `.gitignore`

- [ ] **1.3** Install core dependencies
  ```bash
  # UI Components
  bun add @radix-ui/react-icons class-variance-authority clsx tailwind-merge
  bunx shadcn@latest init
  
  # Forms & Validation
  bun add react-hook-form @hookform/resolvers zod
  
  # State Management
  bun add zustand
  
  # Utilities
  bun add date-fns slugify nanoid
  ```

- [ ] **1.4** Install shadcn/ui components
  ```bash
  bunx shadcn@latest add button input label card badge
  bunx shadcn@latest add dialog sheet dropdown-menu
  bunx shadcn@latest add select checkbox radio-group
  bunx shadcn@latest add table tabs toast sonner
  bunx shadcn@latest add form separator skeleton
  bunx shadcn@latest add avatar command popover
  ```

- [ ] **1.5** Set up project folder structure
  ```
  app/
  ├── (auth)/
  ├── (shop)/
  ├── account/
  ├── admin/
  └── api/
  components/
  ├── ui/
  ├── layout/
  ├── service-areas/
  ├── products/
  ├── cart/
  ├── checkout/
  └── admin/
  lib/
  ├── validations/
  └── utils/
  hooks/
  stores/
  types/
  sql/
  ```

- [ ] **1.6** Configure TypeScript paths in `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./*"],
        "@/components/*": ["./components/*"],
        "@/lib/*": ["./lib/*"],
        "@/hooks/*": ["./hooks/*"],
        "@/stores/*": ["./stores/*"],
        "@/types/*": ["./types/*"]
      }
    }
  }
  ```

- [ ] **1.7** Set up Prettier & ESLint (optional but recommended)
  ```bash
  bun add -D prettier eslint-config-prettier
  ```

---

### Step 2: Database Setup 🟡

**Goal:** Set up Turso (libSQL) database with raw SQL.

- [x] **2.1** Install Turso client
  ```bash
  bun add @libsql/client
  ```

- [ ] **2.2** Set up Turso database
  - Install [Turso CLI](https://docs.turso.tech/reference/turso-cli): `brew install tursodatabase/tap/turso`
  - Create database: `turso db create fnms` (or your db name)
  - Get URL: `turso db show fnms`
  - Create token: `turso db tokens create fnms`

- [ ] **2.3** Add Turso env vars to `.env.local` (see `.env.example`)
  ```env
  TURSO_DATABASE_URL="libsql://fnms-your-username.turso.io"
  TURSO_AUTH_TOKEN="your-auth-token"
  ```
  For local file SQLite only: `TURSO_DATABASE_URL="file:./local.db"` (no token).

- [x] **2.4** Database client (`lib/db.ts`)
  - Uses `@libsql/client` with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
  - Use `db.execute()`, `db.batch()`, etc. for raw SQL.

- [x] **2.5** Raw SQL schema (`sql/init.sql`)
  - Tables: users, addresses, service_areas, area_requests, categories, products, product_images, product_variants, cart_items, promo_codes, orders, order_items, reviews, wishlists, settings.

- [ ] **2.6** Apply schema to Turso
  ```bash
  turso db shell <your-db-name> < sql/init.sql
  ```
  Or run the SQL in Turso dashboard / CLI.

- [ ] **2.7** Create seed script (optional)
  - Script or API that runs `db.execute()` to insert service areas (Mirema, Roysambu, Thome, etc.), sample categories, sample products, and an admin user.
  - Run once after schema is applied.

---

### Step 3: Authentication System 🟡

**Goal:** Implement user registration, login, and session management.

- [x] **3.1** Choose auth provider
  - [x] **Option A:** NextAuth.js (recommended)
  - [ ] **Option B:** Clerk (easiest)
  - [ ] **Option C:** Supabase Auth

- [x] **3.2** Install auth dependencies
  ```bash
  # For NextAuth.js (credentials + raw SQL via lib/db)
  bun add next-auth bcryptjs zod react-hook-form @hookform/resolvers
  bun add -D @types/bcryptjs
  ```

- [x] **3.3** Configure auth (`lib/auth.ts`)
  - [x] Configure credentials provider (email/password); validate against `users` table via `db.execute()` (raw SQL)
  - [x] Set up session strategy (JWT)
  - [x] Define callbacks (session, jwt)

- [x] **3.4** Create auth API routes
  - [x] `app/api/auth/[...nextauth]/route.ts`
  - [x] `app/api/auth/register/route.ts` (registration)

- [x] **3.5** Create auth pages
  - [x] `app/(auth)/login/page.tsx` - Login form
  - [x] `app/(auth)/register/page.tsx` - Registration form
  - [x] `app/(auth)/forgot-password/page.tsx` - Password reset request
  - [x] `app/(auth)/reset-password/page.tsx` - Password reset form (placeholder)

- [x] **3.6** Create auth components
  - [x] `components/auth/login-form.tsx`
  - [x] `components/auth/register-form.tsx`
  - [x] `components/auth/forgot-password-form.tsx`

- [x] **3.7** Create auth validation schemas (`lib/validations/auth.ts`)
  ```typescript
  import { z } from 'zod'
  
  export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
  
  export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(6),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  ```

- [x] **3.8** Create session provider wrapper
  - [x] `components/providers/session-provider.tsx`
  - [x] Wrap app in provider (`app/layout.tsx`)

- [x] **3.9** Create auth hooks
  - [x] `hooks/use-current-user.ts`
  - [x] `hooks/use-session.ts`

- [x] **3.10** Create middleware for protected routes (`middleware.ts`) – protects `/account`, `/admin`, `/checkout`

- [ ] **3.11** Test authentication flow
  - [ ] Register new user
  - [ ] Login with credentials
  - [ ] Logout
  - [ ] Protected route redirect

---

### Step 4: Service Areas System 🟡

**Goal:** Implement the core service area functionality (delivery zones).

- [x] **4.1** Create service area types (`types/service-area.ts`)
  ```typescript
  export interface ServiceArea {
    id: number
    slug: string
    name: string
    deliveryFeeCents: number
    minOrderCents: number
    estimatedTime: string | null
    isActive: boolean
  }
  ```

- [x] **4.2** Create service area API routes
  - [x] `app/api/service-areas/route.ts` - GET (list), POST (create)
  - [x] `app/api/service-areas/[slug]/route.ts` - GET, PUT, DELETE
  - [x] `app/api/service-areas/check/route.ts` - Check if area supported
  - [x] `app/api/service-areas/request/route.ts` - Request new area

- [x] **4.3** Create service area store (`stores/service-area-store.ts`)
  ```typescript
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'
  
  interface ServiceAreaStore {
    selectedArea: ServiceArea | null
    setSelectedArea: (area: ServiceArea | null) => void
  }
  
  export const useServiceAreaStore = create<ServiceAreaStore>()(
    persist(
      (set) => ({
        selectedArea: null,
        setSelectedArea: (area) => set({ selectedArea: area }),
      }),
      { name: 'service-area' }
    )
  )
  ```

- [x] **4.4** Create service area components
  - [x] `components/service-areas/area-selector.tsx` - Dropdown in header
  - [x] `components/service-areas/area-checker.tsx` - "Check your area" widget
  - [x] `components/service-areas/area-card.tsx` - Display area info
  - [x] `components/service-areas/area-list.tsx` - List all areas
  - [x] `components/service-areas/area-request-form.tsx` - Request new area

- [x] **4.5** Create service area pages
  - [x] `app/(shop)/delivery-areas/page.tsx` - List all service areas
  - [x] `app/(shop)/delivery-areas/[slug]/page.tsx` - Area detail page

- [x] **4.6** Integrate area selector into header
  - [x] Show "Deliver to: [Area]" in header (`components/layout/header.tsx`)
  - [x] Persist selection in localStorage (zustand persist)
  - [x] Show delivery fee in area selector and cards

- [x] **4.7** Create area validation utilities (`lib/service-areas.ts`)
  ```typescript
  export async function validateServiceArea(areaId: number): Promise<boolean>
  export async function getDeliveryFee(areaId: number): Promise<number>
  export async function getMinOrderAmount(areaId: number): Promise<number>
  ```

- [ ] **4.8** Test service area system
  - [ ] Select area from dropdown
  - [ ] Check area persistence on refresh
  - [ ] Verify delivery fee updates
  - [ ] Submit area request

---

## Phase 2: Product Catalog

### Step 5: Category Management 🟢

**Goal:** Create category structure for organizing products.

- [x] **5.1** Create category types (`types/category.ts`)

- [x] **5.2** Create category API routes
  - [x] `app/api/categories/route.ts` - GET, POST
  - [x] `app/api/categories/[slug]/route.ts` - GET, PUT, DELETE

- [x] **5.3** Create category components
  - [x] `components/categories/category-card.tsx`
  - [x] `components/categories/category-grid.tsx`
  - [x] `components/categories/category-sidebar.tsx`
  - [x] `components/categories/category-breadcrumb.tsx`

- [x] **5.4** Create category pages
  - [x] `app/(shop)/categories/page.tsx` - All categories
  - [x] `app/(shop)/categories/[slug]/page.tsx` - Category products

- [x] **5.5** Create admin category management
  - [x] `app/admin/categories/page.tsx` - List categories
  - [x] `app/admin/categories/new/page.tsx` - Add category
  - [x] `app/admin/categories/[id]/page.tsx` - Edit category
  - [x] `components/admin/category-form.tsx`
  - [x] `app/admin/layout.tsx` - Admin sidebar layout
  - [x] `app/admin/page.tsx` - Admin dashboard

- [x] **5.6** Seed initial categories (via `bun run db:seed-categories`)
  - [x] Fruits & Vegetables
  - [x] Dairy & Eggs
  - [x] Meat & Poultry
  - [x] Bread & Bakery
  - [x] Beverages
  - [x] Snacks
  - [x] Household Items
  - [x] Personal Care

---

### Step 6: Product Management 🟡

**Goal:** Build product catalog with images, variants, and inventory.

- [x] **6.1** Set up image storage
  - [x] Create Cloudinary account
  - [x] Install Cloudinary SDK
    ```bash
    bun add cloudinary next-cloudinary
    ```
  - [x] Configure environment variables (`.env.example` updated)
  - [x] Create upload utility (`lib/cloudinary.ts`)
  - [x] Create upload API route (`app/api/upload/route.ts`)
  - [x] Create reusable ImageUpload component (`components/ui/image-upload.tsx`)

- [x] **6.2** Create product types (`types/product.ts`)

- [x] **6.3** Create product API routes
  - [x] `app/api/products/route.ts` - GET (category, search), POST
  - [x] `app/api/products/[slug]/route.ts` - GET, PUT, DELETE
  - [x] `app/api/products/[slug]/images/route.ts` - POST add image
  - [x] `app/api/products/featured/route.ts` - GET featured
  - [x] `app/api/products/search/route.ts` - Search products
  - [x] `app/api/upload/route.ts` - Image upload

- [x] **6.4** Create product components
  - [x] `components/products/product-card.tsx`
  - [x] `components/products/product-grid.tsx`
  - [x] `components/products/product-image.tsx`
  - [x] `components/products/product-info.tsx`
  - [x] `components/products/add-to-cart-button.tsx`
  - [x] `components/products/quantity-selector.tsx`
  - [x] `components/products/search-bar.tsx`

- [x] **6.5** Create product pages
  - [x] `app/(shop)/products/page.tsx` - All products
  - [x] `app/(shop)/products/[slug]/page.tsx` - Product detail
  - [x] `app/(shop)/search/page.tsx` - Search results
  - [x] Category page shows products via ProductGrid

- [x] **6.6** Create admin product management
  - [x] `app/admin/products/page.tsx` - Product list
  - [x] `app/admin/products/new/page.tsx` - Add product
  - [x] `app/admin/products/[id]/page.tsx` - Edit product
  - [x] `components/admin/product-form.tsx` - Product form with Cloudinary images

- [x] **6.7** Implement product search
  - [x] Search by name, description (API + search page)

- [ ] **6.8** Implement product filters
  - [ ] Filter by category (API supports ?category=)
  - [ ] Filter by price range
  - [ ] Sort by price, name, newest

- [x] **6.9** Seed sample products (`bun run db:seed-products`)

- [ ] **6.10** Test product management
  - [ ] Create product with images
  - [ ] Edit product
  - [ ] Delete product
  - [ ] Filter and search

---

## Phase 3: Shopping Cart

### Step 7: Cart System 🟡

**Goal:** Implement shopping cart with persistence and validation.

- [x] **7.1** Create cart types (`types/cart.ts`)

- [x] **7.2** Create cart store (`stores/cart-store.ts`) – Zustand + persist (localStorage)

- [x] **7.3** Create cart API routes (for logged-in users)
  - [x] `app/api/cart/route.ts` - GET, POST (sync), DELETE

- [x] **7.4** Create cart components
  - [x] `components/cart/cart-icon.tsx` - Header cart icon with count
  - [x] `components/cart/cart-sheet.tsx` - Slide-out cart drawer
  - [x] `components/cart/cart-item.tsx` - Single cart item
  - [x] `components/cart/cart-item-list.tsx` - List of items
  - [x] `components/cart/cart-summary.tsx` - Subtotal, delivery fee, total
  - [x] `components/cart/cart-empty.tsx` - Empty cart state

- [x] **7.5** Create cart page
  - [x] `app/(shop)/cart/page.tsx` - Full cart page

- [x] **7.6** Implement cart persistence
  - [x] Guest users: localStorage (Zustand persist)
  - [x] Logged-in users: GET/POST /api/cart to sync (merge on login can be added later)

- [x] **7.7** Implement stock validation
  - [x] Cap quantity by stock in store; out-of-stock disabled on product page

- [x] **7.8** Implement cart calculations
  - [x] Subtotal from items; delivery fee from selected service area; total

- [ ] **7.9** Add cart animations
  - [ ] Add to cart feedback
  - [ ] Quantity update animation
  - [ ] Remove item animation

- [ ] **7.10** Test cart functionality
  - [ ] Add items to cart
  - [ ] Update quantities
  - [ ] Remove items
  - [ ] Persist on refresh
  - [ ] Sync on login

---

## Phase 4: Checkout & Payments

### Step 8: Checkout Flow 🔴

**Goal:** Build multi-step checkout with area validation.

- [ ] **8.1** Create checkout types (`types/checkout.ts`)
  ```typescript
  export interface CheckoutData {
    // Delivery
    serviceAreaId: string
    recipientName: string
    recipientPhone: string
    deliveryAddress: string
    deliveryNotes?: string
    deliverySlot?: string
    
    // Payment
    paymentMethod: 'MPESA' | 'CASH_ON_DELIVERY'
  }
  ```

- [ ] **8.2** Create checkout store (`stores/checkout-store.ts`)
  - [ ] Store delivery info
  - [ ] Store payment method
  - [ ] Track current step
  - [ ] Validation state

- [ ] **8.3** Create checkout validation (`lib/validations/checkout.ts`)
  ```typescript
  export const deliverySchema = z.object({
    serviceAreaId: z.string().min(1, "Please select a delivery area"),
    recipientName: z.string().min(2),
    recipientPhone: z.string().min(10),
    deliveryAddress: z.string().min(5),
    deliveryNotes: z.string().optional(),
  })
  ```

- [ ] **8.4** Create checkout components
  - [ ] `components/checkout/checkout-steps.tsx` - Step indicator
  - [ ] `components/checkout/delivery-form.tsx` - Delivery details
  - [ ] `components/checkout/area-select.tsx` - Service area dropdown
  - [ ] `components/checkout/time-slot-select.tsx` - Delivery time
  - [ ] `components/checkout/payment-method.tsx` - Payment options
  - [ ] `components/checkout/order-summary.tsx` - Order review
  - [ ] `components/checkout/checkout-button.tsx` - Place order

- [ ] **8.5** Create checkout page
  - [ ] `app/(shop)/checkout/page.tsx` - Main checkout
  - [ ] Step 1: Delivery information
  - [ ] Step 2: Review order
  - [ ] Step 3: Payment

- [ ] **8.6** Implement area validation in checkout
  - [ ] Validate area is supported
  - [ ] Check minimum order amount for area
  - [ ] Display area-specific delivery fee
  - [ ] Block checkout if area not selected

- [ ] **8.7** Create order API
  - [ ] `app/api/orders/route.ts` - Create order
  - [ ] Generate unique order number
  - [ ] Validate stock before creating
  - [ ] Calculate totals server-side

- [ ] **8.8** Create order confirmation page
  - [ ] `app/(shop)/checkout/success/page.tsx`
  - [ ] Show order number
  - [ ] Show order details
  - [ ] Clear cart on success

---

### Step 9: M-Pesa Payment Integration 🔴

**Goal:** Integrate M-Pesa STK Push for payments.

- [ ] **9.1** Set up M-Pesa Daraja API
  - [ ] Register at developer.safaricom.co.ke
  - [ ] Create app and get credentials
  - [ ] Get test credentials for sandbox

- [ ] **9.2** Add M-Pesa environment variables
  ```env
  MPESA_CONSUMER_KEY=""
  MPESA_CONSUMER_SECRET=""
  MPESA_PASSKEY=""
  MPESA_SHORTCODE=""
  MPESA_CALLBACK_URL=""
  MPESA_ENV="sandbox" # or "production"
  ```

- [ ] **9.3** Create M-Pesa utilities (`lib/mpesa.ts`)
  ```typescript
  export async function getAccessToken(): Promise<string>
  export async function initiateSTKPush(params: STKPushParams): Promise<STKPushResponse>
  export async function checkTransactionStatus(checkoutRequestId: string): Promise<TransactionStatus>
  ```

- [ ] **9.4** Create M-Pesa API routes
  - [ ] `app/api/payments/mpesa/initiate/route.ts` - Initiate STK push
  - [ ] `app/api/payments/mpesa/callback/route.ts` - Handle callback
  - [ ] `app/api/payments/mpesa/status/route.ts` - Check status

- [ ] **9.5** Create payment components
  - [ ] `components/checkout/mpesa-payment.tsx` - M-Pesa form
  - [ ] `components/checkout/payment-status.tsx` - Processing status
  - [ ] `components/checkout/payment-success.tsx` - Success message
  - [ ] `components/checkout/payment-failed.tsx` - Failure message

- [ ] **9.6** Implement payment flow
  - [ ] User enters phone number
  - [ ] Initiate STK push
  - [ ] Show "Check your phone" message
  - [ ] Poll for payment status
  - [ ] Handle success/failure

- [ ] **9.7** Implement Cash on Delivery
  - [ ] Skip payment step
  - [ ] Mark order as COD
  - [ ] Show COD confirmation

- [ ] **9.8** Handle payment edge cases
  - [ ] Timeout handling
  - [ ] Retry mechanism
  - [ ] Duplicate prevention (idempotency)
  - [ ] Refund handling

- [ ] **9.9** Test payment flow
  - [ ] Test with sandbox credentials
  - [ ] Test successful payment
  - [ ] Test failed payment
  - [ ] Test timeout

---

## Phase 5: Order Management

### Step 10: Customer Order Tracking 🟡

**Goal:** Allow customers to view and track their orders.

- [ ] **10.1** Create order types (`types/order.ts`)

- [ ] **10.2** Create order API routes
  - [ ] `app/api/orders/route.ts` - GET user orders
  - [ ] `app/api/orders/[id]/route.ts` - GET order details
  - [ ] `app/api/orders/[id]/cancel/route.ts` - Cancel order

- [ ] **10.3** Create order components
  - [ ] `components/orders/order-card.tsx` - Order summary card
  - [ ] `components/orders/order-list.tsx` - List of orders
  - [ ] `components/orders/order-status.tsx` - Status badge
  - [ ] `components/orders/order-timeline.tsx` - Status timeline
  - [ ] `components/orders/order-items.tsx` - List order items
  - [ ] `components/orders/reorder-button.tsx` - Reorder action

- [ ] **10.4** Create order pages
  - [ ] `app/account/orders/page.tsx` - Order history
  - [ ] `app/account/orders/[id]/page.tsx` - Order details

- [ ] **10.5** Implement order status flow
  ```
  PENDING → CONFIRMED → PROCESSING → OUT_FOR_DELIVERY → DELIVERED
                    ↘ CANCELLED
  ```

- [ ] **10.6** Implement reorder functionality
  - [ ] Add all items from previous order to cart
  - [ ] Handle out-of-stock items

---

### Step 11: Admin Order Management 🟡

**Goal:** Build admin interface for processing orders.

- [ ] **11.1** Create admin order API routes
  - [ ] `app/api/admin/orders/route.ts` - GET all orders
  - [ ] `app/api/admin/orders/[id]/route.ts` - GET, PUT
  - [ ] `app/api/admin/orders/[id]/status/route.ts` - Update status

- [ ] **11.2** Create admin order components
  - [ ] `components/admin/orders/order-table.tsx` - Orders table
  - [ ] `components/admin/orders/order-filters.tsx` - Filter by status/date
  - [ ] `components/admin/orders/order-detail.tsx` - Full order view
  - [ ] `components/admin/orders/status-update.tsx` - Status dropdown
  - [ ] `components/admin/orders/order-receipt.tsx` - Printable receipt

- [ ] **11.3** Create admin order pages
  - [ ] `app/admin/orders/page.tsx` - Orders list
  - [ ] `app/admin/orders/[id]/page.tsx` - Order detail

- [ ] **11.4** Implement order status updates
  - [ ] Update status
  - [ ] Add status notes
  - [ ] Trigger notifications

- [ ] **11.5** Implement order filtering
  - [ ] Filter by status
  - [ ] Filter by date range
  - [ ] Filter by service area
  - [ ] Search by order number

---

## Phase 6: Notifications

### Step 12: SMS Notifications 🟡

**Goal:** Send order updates via SMS using Africa's Talking.

- [ ] **12.1** Set up Africa's Talking
  - [ ] Create account at africastalking.com
  - [ ] Get API credentials
  - [ ] Set up sandbox for testing

- [ ] **12.2** Add environment variables
  ```env
  AT_API_KEY=""
  AT_USERNAME=""
  AT_SENDER_ID="" # Optional shortcode
  ```

- [ ] **12.3** Install Africa's Talking SDK
  ```bash
  bun add africastalking
  ```

- [ ] **12.4** Create SMS utility (`lib/sms.ts`)
  ```typescript
  export async function sendSMS(phone: string, message: string): Promise<void>
  export async function sendOrderConfirmation(order: Order): Promise<void>
  export async function sendDeliveryUpdate(order: Order): Promise<void>
  ```

- [ ] **12.5** Create SMS templates
  - [ ] Order confirmation
  - [ ] Order status update
  - [ ] Out for delivery
  - [ ] Delivered

- [ ] **12.6** Integrate SMS sending
  - [ ] On order creation
  - [ ] On status change
  - [ ] On delivery

---

### Step 13: Email Notifications 🟢

**Goal:** Send transactional emails for orders and auth.

- [ ] **13.1** Set up Resend
  - [ ] Create account at resend.com
  - [ ] Verify domain
  - [ ] Get API key

- [ ] **13.2** Install Resend
  ```bash
  bun add resend @react-email/components
  ```

- [ ] **13.3** Create email templates (`emails/`)
  - [ ] `emails/order-confirmation.tsx`
  - [ ] `emails/order-status-update.tsx`
  - [ ] `emails/welcome.tsx`
  - [ ] `emails/password-reset.tsx`

- [ ] **13.4** Create email utility (`lib/email.ts`)
  ```typescript
  export async function sendEmail(params: EmailParams): Promise<void>
  export async function sendOrderConfirmationEmail(order: Order): Promise<void>
  ```

- [ ] **13.5** Integrate email sending
  - [ ] Welcome email on registration
  - [ ] Order confirmation
  - [ ] Password reset

---

## Phase 7: Admin Dashboard

### Step 14: Admin Dashboard & Analytics 🟡

**Goal:** Build admin dashboard with key metrics.

- [ ] **14.1** Create dashboard API routes
  - [ ] `app/api/admin/dashboard/route.ts` - Dashboard stats
  - [ ] `app/api/admin/reports/sales/route.ts` - Sales data
  - [ ] `app/api/admin/reports/orders/route.ts` - Order data
  - [ ] `app/api/admin/reports/products/route.ts` - Product data

- [ ] **14.2** Create dashboard components
  - [ ] `components/admin/dashboard/stats-cards.tsx` - Key metrics
  - [ ] `components/admin/dashboard/sales-chart.tsx` - Revenue chart
  - [ ] `components/admin/dashboard/orders-chart.tsx` - Orders chart
  - [ ] `components/admin/dashboard/recent-orders.tsx` - Latest orders
  - [ ] `components/admin/dashboard/top-products.tsx` - Best sellers
  - [ ] `components/admin/dashboard/low-stock-alert.tsx` - Stock warnings

- [ ] **14.3** Create dashboard page
  - [ ] `app/admin/page.tsx` - Main dashboard

- [ ] **14.4** Implement metrics
  - [ ] Today's sales
  - [ ] Total orders
  - [ ] Pending orders
  - [ ] Low stock items
  - [ ] Revenue by period
  - [ ] Orders by area

---

### Step 15: Admin Service Area Management 🟢

**Goal:** Allow admin to manage delivery areas.

- [ ] **15.1** Create admin service area API routes
  - [ ] `app/api/admin/service-areas/route.ts`
  - [ ] `app/api/admin/service-areas/[id]/route.ts`
  - [ ] `app/api/admin/area-requests/route.ts`

- [ ] **15.2** Create admin service area components
  - [ ] `components/admin/service-areas/area-table.tsx`
  - [ ] `components/admin/service-areas/area-form.tsx`
  - [ ] `components/admin/service-areas/area-requests-table.tsx`

- [ ] **15.3** Create admin service area pages
  - [ ] `app/admin/service-areas/page.tsx` - List areas
  - [ ] `app/admin/service-areas/new/page.tsx` - Add area
  - [ ] `app/admin/service-areas/[id]/page.tsx` - Edit area
  - [ ] `app/admin/area-requests/page.tsx` - View requests

- [ ] **15.4** Implement area management
  - [ ] Create new area
  - [ ] Edit area (fee, minimum, status)
  - [ ] Disable/enable area
  - [ ] View area request demand

---

### Step 16: Inventory Management 🟡

**Goal:** Track and manage product inventory.

- [ ] **16.1** Create inventory API routes
  - [ ] `app/api/admin/inventory/route.ts` - Get inventory
  - [ ] `app/api/admin/inventory/[productId]/route.ts` - Update stock
  - [ ] `app/api/admin/inventory/low-stock/route.ts` - Low stock items

- [ ] **16.2** Create inventory components
  - [ ] `components/admin/inventory/inventory-table.tsx`
  - [ ] `components/admin/inventory/stock-update-form.tsx`
  - [ ] `components/admin/inventory/low-stock-list.tsx`

- [ ] **16.3** Create inventory page
  - [ ] `app/admin/inventory/page.tsx`

- [ ] **16.4** Implement inventory features
  - [ ] Update stock levels
  - [ ] Set low stock threshold
  - [ ] Low stock alerts
  - [ ] Stock history (optional)

---

## Phase 8: User Account Features

### Step 17: User Profile & Addresses 🟢

**Goal:** Allow users to manage their profile and addresses.

- [ ] **17.1** Create user API routes
  - [ ] `app/api/user/profile/route.ts` - GET, PUT
  - [ ] `app/api/user/addresses/route.ts` - GET, POST
  - [ ] `app/api/user/addresses/[id]/route.ts` - PUT, DELETE

- [ ] **17.2** Create profile components
  - [ ] `components/account/profile-form.tsx`
  - [ ] `components/account/address-card.tsx`
  - [ ] `components/account/address-form.tsx`
  - [ ] `components/account/address-list.tsx`

- [ ] **17.3** Create account pages
  - [ ] `app/account/page.tsx` - Account overview
  - [ ] `app/account/profile/page.tsx` - Edit profile
  - [ ] `app/account/addresses/page.tsx` - Manage addresses

- [ ] **17.4** Implement address validation
  - [ ] Validate against service areas
  - [ ] Set default address

---

### Step 18: Wishlist 🟢

**Goal:** Allow users to save products for later.

- [ ] **18.1** Create wishlist API routes
  - [ ] `app/api/wishlist/route.ts` - GET, POST
  - [ ] `app/api/wishlist/[productId]/route.ts` - DELETE

- [ ] **18.2** Create wishlist components
  - [ ] `components/wishlist/wishlist-button.tsx`
  - [ ] `components/wishlist/wishlist-item.tsx`
  - [ ] `components/wishlist/wishlist-list.tsx`

- [ ] **18.3** Create wishlist page
  - [ ] `app/account/wishlist/page.tsx`

- [ ] **18.4** Implement wishlist features
  - [ ] Add/remove from wishlist
  - [ ] Move to cart
  - [ ] Check stock status

---

## Phase 9: Additional Features

### Step 19: Promo Codes & Discounts 🟡

**Goal:** Implement promotional codes system.

- [ ] **19.1** Create promo API routes
  - [ ] `app/api/promo/validate/route.ts` - Validate promo code
  - [ ] `app/api/admin/promo/route.ts` - CRUD promo codes

- [ ] **19.2** Create promo components
  - [ ] `components/checkout/promo-input.tsx`
  - [ ] `components/admin/promo/promo-form.tsx`
  - [ ] `components/admin/promo/promo-table.tsx`

- [ ] **19.3** Create admin promo pages
  - [ ] `app/admin/promotions/page.tsx`
  - [ ] `app/admin/promotions/new/page.tsx`
  - [ ] `app/admin/promotions/[id]/page.tsx`

- [ ] **19.4** Implement promo features
  - [ ] Percentage discount
  - [ ] Fixed amount discount
  - [ ] Minimum order requirement
  - [ ] Usage limits
  - [ ] Expiry dates
  - [ ] Area-specific promos (optional)

---

### Step 20: Product Reviews 🟢

**Goal:** Allow customers to review products.

- [ ] **20.1** Create review API routes
  - [ ] `app/api/products/[slug]/reviews/route.ts` - GET, POST
  - [ ] `app/api/reviews/[id]/route.ts` - PUT, DELETE

- [ ] **20.2** Create review components
  - [ ] `components/reviews/review-card.tsx`
  - [ ] `components/reviews/review-list.tsx`
  - [ ] `components/reviews/review-form.tsx`
  - [ ] `components/reviews/star-rating.tsx`
  - [ ] `components/reviews/rating-summary.tsx`

- [ ] **20.3** Implement review features
  - [ ] Submit review (verified purchases only)
  - [ ] Star rating (1-5)
  - [ ] Review text
  - [ ] Display average rating

---

## Phase 10: Polish & Launch

### Step 21: Layout & Navigation 🟢

**Goal:** Build consistent layout and navigation.

- [ ] **21.1** Create layout components
  - [ ] `components/layout/header.tsx` - Main header
  - [ ] `components/layout/mobile-nav.tsx` - Mobile menu
  - [ ] `components/layout/footer.tsx` - Footer
  - [ ] `components/layout/sidebar.tsx` - Category sidebar
  - [ ] `components/layout/admin-sidebar.tsx` - Admin nav

- [ ] **21.2** Create shared layouts
  - [ ] `app/(shop)/layout.tsx` - Shop layout
  - [ ] `app/account/layout.tsx` - Account layout
  - [ ] `app/admin/layout.tsx` - Admin layout

- [ ] **21.3** Implement navigation
  - [ ] Category menu
  - [ ] User menu (login/account)
  - [ ] Cart icon with count
  - [ ] Area selector
  - [ ] Search bar
  - [ ] Mobile-responsive nav

---

### Step 22: Homepage 🟡

**Goal:** Create engaging homepage with key sections.

- [ ] **22.1** Create homepage components
  - [ ] `components/home/hero-banner.tsx` - Hero section
  - [ ] `components/home/area-checker.tsx` - Check delivery
  - [ ] `components/home/featured-categories.tsx`
  - [ ] `components/home/featured-products.tsx`
  - [ ] `components/home/deals-section.tsx`
  - [ ] `components/home/how-it-works.tsx`
  - [ ] `components/home/service-areas-preview.tsx`

- [ ] **22.2** Build homepage
  - [ ] `app/(shop)/page.tsx`
  - [ ] Hero with area selector
  - [ ] Featured categories
  - [ ] Featured products
  - [ ] Service areas info
  - [ ] How it works

---

### Step 23: Static Pages 🟢

**Goal:** Create essential static pages.

- [ ] **23.1** Create static pages
  - [ ] `app/(shop)/about/page.tsx` - About us
  - [ ] `app/(shop)/contact/page.tsx` - Contact form
  - [ ] `app/(shop)/faq/page.tsx` - FAQ
  - [ ] `app/(shop)/terms/page.tsx` - Terms & conditions
  - [ ] `app/(shop)/privacy/page.tsx` - Privacy policy
  - [ ] `app/(shop)/delivery-info/page.tsx` - Delivery info

- [ ] **23.2** Create contact form API
  - [ ] `app/api/contact/route.ts` - Handle submissions

---

### Step 24: SEO & Performance 🟡

**Goal:** Optimize for search engines and performance.

- [ ] **24.1** Implement SEO
  - [ ] Add metadata to all pages
  - [ ] Create `app/sitemap.ts`
  - [ ] Create `app/robots.ts`
  - [ ] Add Open Graph tags
  - [ ] Add structured data (JSON-LD)

- [ ] **24.2** Performance optimization
  - [ ] Image optimization (next/image)
  - [ ] Lazy loading
  - [ ] Code splitting
  - [ ] Caching headers

- [ ] **24.3** Analytics
  - [ ] Set up Google Analytics
  - [ ] Track key events (add to cart, checkout, purchase)

---

### Step 25: Testing & QA 🟡

**Goal:** Test all functionality before launch.

- [ ] **25.1** Manual testing checklist
  - [ ] User registration & login
  - [ ] Browse products
  - [ ] Search & filter
  - [ ] Add to cart
  - [ ] Checkout flow
  - [ ] Payment (M-Pesa)
  - [ ] Order tracking
  - [ ] Admin product management
  - [ ] Admin order management
  - [ ] Service area validation
  - [ ] Mobile responsiveness

- [ ] **25.2** Cross-browser testing
  - [ ] Chrome
  - [ ] Safari
  - [ ] Firefox
  - [ ] Mobile browsers

- [ ] **25.3** Fix bugs and issues

---

### Step 26: Deployment 🟢

**Goal:** Deploy to production.

- [ ] **26.1** Set up production database
  - [ ] Create production database
  - [ ] Run migrations

- [ ] **26.2** Configure production environment
  - [ ] Set all environment variables
  - [ ] Configure M-Pesa production credentials
  - [ ] Set up production SMS
  - [ ] Configure email domain

- [ ] **26.3** Deploy to Vercel
  ```bash
  vercel --prod
  ```

- [ ] **26.4** Post-deployment
  - [ ] Verify all features work
  - [ ] Test payment flow
  - [ ] Monitor for errors
  - [ ] Set up error tracking (Sentry)

---

### Step 27: Launch Checklist 🟢

**Goal:** Final checks before going live.

- [ ] **27.1** Content
  - [ ] All products added
  - [ ] All categories set up
  - [ ] Service areas configured
  - [ ] Delivery fees set
  - [ ] Contact information correct

- [ ] **27.2** Technical
  - [ ] SSL certificate active
  - [ ] Domain configured
  - [ ] Email sending works
  - [ ] SMS sending works
  - [ ] Payments working

- [ ] **27.3** Legal
  - [ ] Terms & conditions
  - [ ] Privacy policy
  - [ ] Refund policy

- [ ] **27.4** Go Live!
  - [ ] Update "Coming Soon" page to real homepage
  - [ ] Announce launch
  - [ ] Monitor orders

---

## Post-Launch Tasks

### Ongoing Maintenance

- [ ] Monitor error logs
- [ ] Track analytics
- [ ] Respond to customer inquiries
- [ ] Process orders daily
- [ ] Update inventory
- [ ] Add new products
- [ ] Expand service areas based on demand

### Future Enhancements (Phase 2+)

- [ ] Phone OTP authentication
- [ ] Social login (Google)
- [ ] Delivery time slot scheduling
- [ ] Real-time order tracking
- [ ] Product recommendations
- [ ] Recently viewed products
- [ ] Loyalty program
- [ ] Mobile app

---

## Quick Reference

### Commands
```bash
# Development
bun dev

# Database (Turso / raw SQL)
turso db shell <db-name> < sql/init.sql   # Apply schema
# Use Turso dashboard or CLI to view data; run your own seed script to seed data

# Deployment
vercel                  # Preview deployment
vercel --prod           # Production deployment
```

### Key Files
- `sql/init.sql` - Database schema (Turso/SQLite)
- `lib/db.ts` - Turso client (raw SQL)
- `lib/auth.ts` - Auth configuration
- `stores/cart-store.ts` - Cart state
- `stores/service-area-store.ts` - Area state

---

**Good luck building FnM's Mini Mart! 🛒**
