# FnM's Mini Mart - Grocery Ecommerce Platform

> Fresh groceries, everyday essentials, and more—delivered to your door. Your neighborhood mini mart, now online.

## Table of Contents

- [Overview](#overview)
- [Service Areas](#service-areas)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [Core Features](#core-features)
- [Pages & Screens](#pages--screens)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Third-Party Integrations](#third-party-integrations)
- [Security Considerations](#security-considerations)
- [Development Phases](#development-phases)
- [Getting Started](#getting-started)

---

## Overview

FnM's Mini Mart is an online grocery delivery platform serving **select neighborhoods in Nairobi, Kenya**. The platform enables customers in supported areas to browse products, place orders, and receive deliveries at their doorstep.

**Important:** We currently only deliver to specific areas. Check [Service Areas](#service-areas) for coverage.

**Contact:**
- Email: support@fmns.co.ke
- Phone: 0721530181

---

## Service Areas

FnM's Mini Mart delivers exclusively to the following neighborhoods in Nairobi:

### Currently Supported Areas

| Area | Delivery Fee | Min. Order | Delivery Time |
|------|-------------|------------|---------------|
| Mirema | KSh 100 | KSh 500 | 30-60 mins |
| Roysambu | KSh 100 | KSh 500 | 30-60 mins |
| Kasarani | KSh 150 | KSh 500 | 45-90 mins |
| Thome | KSh 100 | KSh 500 | 30-60 mins |
| Zimmerman | KSh 100 | KSh 500 | 30-60 mins |
| Githurai 44 | KSh 150 | KSh 700 | 45-90 mins |
| Kahawa West | KSh 150 | KSh 700 | 45-90 mins |
| Kahawa Sukari | KSh 150 | KSh 700 | 45-90 mins |
| Garden Estate | KSh 100 | KSh 500 | 30-60 mins |
| Marurui | KSh 100 | KSh 500 | 30-60 mins |

> **Note:** Areas and fees are configurable by admin and may expand over time.

### Service Area Business Rules

1. **Area Validation at Checkout**
   - Users must select a supported delivery area before placing an order
   - Orders to unsupported areas are blocked with a friendly message
   - Users can request new areas (captured for future expansion)

2. **Dynamic Delivery Fees**
   - Fees vary by area based on distance from store
   - Each area can have a different minimum order amount
   - Free delivery promotions can be applied per area

3. **Delivery Time Estimates**
   - Different areas have different estimated delivery windows
   - Peak hours may affect delivery times
   - Real-time updates via SMS

### UX Considerations for Service Areas

#### Homepage / Entry Point
- [ ] **Area selector banner** - Prominent "Deliver to: [Select Area]" in header
- [ ] **Area checker widget** - "Check if we deliver to your area" input field
- [ ] **Service area map** - Visual map showing covered neighborhoods
- [ ] **"Coming Soon" waitlist** - Capture interest for unsupported areas

#### Product Browsing
- [ ] Show delivery availability based on selected area
- [ ] Display area-specific pricing if applicable
- [ ] Persist selected area in session/localStorage

#### Cart & Checkout
- [ ] Validate area before allowing checkout
- [ ] Show delivery fee based on selected area
- [ ] Display minimum order warning if below threshold
- [ ] Area dropdown with only supported options
- [ ] Clear messaging if area not supported

#### User Account
- [ ] Save preferred delivery area
- [ ] Address validation against supported areas
- [ ] Notify users when their requested area becomes available

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand or React Context
- **Form Handling:** React Hook Form + Zod validation

### Backend
- **API:** Next.js API Routes / Server Actions
- **Database:** PostgreSQL (via Supabase or Neon)
- **ORM:** Prisma or Drizzle
- **Authentication:** NextAuth.js / Clerk / Supabase Auth
- **File Storage:** Cloudinary / Supabase Storage

### Infrastructure
- **Hosting:** Vercel
- **Database Hosting:** Supabase / Neon / PlanetScale
- **CDN:** Vercel Edge Network
- **Email:** Resend / SendGrid
- **SMS:** Africa's Talking / Twilio

---

## User Roles

### 1. Customer
- Browse and search products
- Add items to cart
- Place and track orders
- Manage profile and addresses
- View order history
- Leave reviews

### 2. Admin
- Manage products (CRUD)
- Manage categories
- Process orders
- Manage inventory
- View analytics/reports
- Manage customers
- Configure site settings

### 3. Delivery Personnel (Optional - Phase 2)
- View assigned deliveries
- Update delivery status
- Navigate to delivery locations

---

## Core Features

### Customer Features

#### Product Discovery
- [ ] Product catalog with grid/list view
- [ ] Category navigation (sidebar/header)
- [ ] Search with autocomplete
- [ ] Filters (price, category, brand, availability)
- [ ] Sort (price, popularity, newest)
- [ ] Product detail pages with images, description, nutrition info
- [ ] Related/recommended products
- [ ] Recently viewed products

#### Shopping Cart
- [ ] Add/remove items
- [ ] Update quantities
- [ ] Cart persistence (localStorage + database sync)
- [ ] Cart summary with subtotal
- [ ] Apply promo codes/coupons
- [ ] Save for later
- [ ] Stock validation

#### Checkout
- [ ] **Service area validation** (block unsupported areas)
- [ ] Area selector dropdown (supported areas only)
- [ ] Dynamic delivery fee based on area
- [ ] Minimum order validation per area
- [ ] Guest checkout option
- [ ] Multiple delivery addresses (validated against service areas)
- [ ] Delivery time slot selection (varies by area)
- [ ] Order notes/special instructions
- [ ] Order summary review
- [ ] Multiple payment options

#### User Account
- [ ] Registration (email, phone, social)
- [ ] Login/logout
- [ ] Profile management
- [ ] Address book
- [ ] Order history
- [ ] Wishlist/favorites
- [ ] Notification preferences

#### Orders
- [ ] Order placement
- [ ] Order confirmation (email + SMS)
- [ ] Real-time order tracking
- [ ] Order cancellation (within timeframe)
- [ ] Reorder previous orders
- [ ] Order receipts/invoices

### Admin Features

#### Dashboard
- [ ] Sales overview (daily, weekly, monthly)
- [ ] Order statistics
- [ ] Low stock alerts
- [ ] Recent orders
- [ ] Top selling products
- [ ] Revenue charts

#### Product Management
- [ ] Add/edit/delete products
- [ ] Bulk product import (CSV)
- [ ] Product images (multiple)
- [ ] Product variants (size, weight)
- [ ] Inventory management
- [ ] Product categories
- [ ] Product tags
- [ ] Featured/promoted products
- [ ] Product visibility toggle

#### Order Management
- [ ] Order list with filters
- [ ] Order status updates
- [ ] Order details view
- [ ] Print packing slips
- [ ] Assign to delivery
- [ ] Refund processing

#### Category Management
- [ ] Create/edit/delete categories
- [ ] Category hierarchy (parent/child)
- [ ] Category images
- [ ] Category ordering

#### Customer Management
- [ ] Customer list
- [ ] Customer details/history
- [ ] Customer segments
- [ ] Block/unblock customers

#### Service Area Management
- [ ] Add/edit/delete service areas
- [ ] Set delivery fee per area
- [ ] Set minimum order amount per area
- [ ] Set estimated delivery time per area
- [ ] Enable/disable areas (seasonal/temporary)
- [ ] View area request submissions
- [ ] Bulk import/export service areas

#### Settings
- [ ] Store information
- [ ] Operating hours per area (if different)
- [ ] Default delivery fee
- [ ] Default minimum order amount
- [ ] Payment methods
- [ ] Tax configuration
- [ ] Promo codes/discounts (can be area-specific)

---

## Pages & Screens

### Public Pages
```
/                       # Home page (with area selector)
/delivery-areas         # Service areas map & list
/delivery-areas/[slug]  # Area-specific info page
/products               # All products
/products/[slug]        # Product detail
/categories             # All categories
/categories/[slug]      # Category products
/search                 # Search results
/cart                   # Shopping cart
/checkout               # Checkout flow (with area validation)
/about                  # About us
/contact                # Contact page
/faq                    # FAQ
/terms                  # Terms & conditions
/privacy                # Privacy policy
/delivery-info          # Delivery information & policies
```

### Auth Pages
```
/login                  # Login
/register               # Registration
/forgot-password        # Password reset request
/reset-password         # Password reset
/verify-email           # Email verification
```

### Customer Dashboard
```
/account                # Account overview
/account/profile        # Profile settings
/account/addresses      # Address management
/account/orders         # Order history
/account/orders/[id]    # Order details
/account/wishlist       # Saved items
/account/notifications  # Notification settings
```

### Admin Dashboard
```
/admin                      # Admin dashboard
/admin/products             # Product list
/admin/products/new         # Add product
/admin/products/[id]        # Edit product
/admin/categories           # Category management
/admin/orders               # Order list
/admin/orders/[id]          # Order details
/admin/customers            # Customer list
/admin/customers/[id]       # Customer details
/admin/service-areas        # Service area management
/admin/service-areas/new    # Add new service area
/admin/service-areas/[id]   # Edit service area
/admin/area-requests        # View area requests from customers
/admin/inventory            # Inventory management
/admin/promotions           # Promo codes
/admin/reports              # Reports & analytics
/admin/reports/by-area      # Sales by service area
/admin/settings             # Store settings
```

---

## Database Schema

### Core Tables

```prisma
// User & Authentication
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  password      String?
  name          String?
  role          Role      @default(CUSTOMER)
  emailVerified DateTime?
  image         String?
  addresses     Address[]
  orders        Order[]
  cartItems     CartItem[]
  wishlist      Wishlist[]
  reviews       Review[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  CUSTOMER
  ADMIN
  DELIVERY
}

model Address {
  id             String        @id @default(cuid())
  userId         String
  user           User          @relation(fields: [userId], references: [id])
  name           String        // e.g., "Home", "Office"
  recipient      String
  phone          String
  street         String
  apartment      String?
  city           String        @default("Nairobi")
  serviceAreaId  String        // Must be a supported service area
  serviceArea    ServiceArea   @relation(fields: [serviceAreaId], references: [id])
  landmark       String?
  isDefault      Boolean       @default(false)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

// Products
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  parentId    String?
  parent      Category?  @relation("CategoryChildren", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryChildren")
  products    Product[]
  sortOrder   Int        @default(0)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Product {
  id           String      @id @default(cuid())
  name         String
  slug         String      @unique
  description  String?
  price        Decimal     @db.Decimal(10, 2)
  comparePrice Decimal?    @db.Decimal(10, 2) // Original price for discounts
  costPrice    Decimal?    @db.Decimal(10, 2)
  sku          String?     @unique
  barcode      String?
  weight       Decimal?    @db.Decimal(10, 3)
  unit         String      @default("piece") // piece, kg, g, liter, etc.
  stock        Int         @default(0)
  lowStockAt   Int         @default(10)
  categoryId   String
  category     Category    @relation(fields: [categoryId], references: [id])
  images       ProductImage[]
  tags         ProductTag[]
  variants     ProductVariant[]
  cartItems    CartItem[]
  orderItems   OrderItem[]
  wishlist     Wishlist[]
  reviews      Review[]
  isFeatured   Boolean     @default(false)
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int      @default(0)
}

model ProductTag {
  id       String    @id @default(cuid())
  name     String    @unique
  products Product[]
}

model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String   // e.g., "500g", "1kg", "2 liters"
  price     Decimal  @db.Decimal(10, 2)
  stock     Int      @default(0)
  sku       String?
}

// Cart
model CartItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
}

// Orders
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String?
  user            User?         @relation(fields: [userId], references: [id])
  status          OrderStatus   @default(PENDING)
  items           OrderItem[]
  subtotal        Decimal       @db.Decimal(10, 2)
  deliveryFee     Decimal       @db.Decimal(10, 2)
  discount        Decimal       @default(0) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  
  // Delivery Info (linked to service area)
  recipientName   String
  recipientPhone  String
  deliveryAddress String        // Full address string
  serviceAreaId   String        // Must be a supported service area
  serviceArea     ServiceArea   @relation(fields: [serviceAreaId], references: [id])
  deliveryNotes   String?
  deliverySlot    String?       // e.g., "9am-12pm"
  deliveryDate    DateTime?
  
  // Payment
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  paymentRef      String?
  
  // Promo
  promoCodeId     String?
  promoCode       PromoCode?    @relation(fields: [promoCodeId], references: [id])
  
  // Guest info (if no user)
  guestEmail      String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  name      String   // Snapshot of product name
  price     Decimal  @db.Decimal(10, 2)
  quantity  Int
  total     Decimal  @db.Decimal(10, 2)
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  MPESA
  CARD
  CASH_ON_DELIVERY
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

// Promotions
model PromoCode {
  id            String      @id @default(cuid())
  code          String      @unique
  description   String?
  discountType  DiscountType
  discountValue Decimal     @db.Decimal(10, 2)
  minOrderValue Decimal?    @db.Decimal(10, 2)
  maxDiscount   Decimal?    @db.Decimal(10, 2)
  usageLimit    Int?
  usageCount    Int         @default(0)
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean     @default(true)
  orders        Order[]
  createdAt     DateTime    @default(now())
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

// Reviews
model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  comment   String?
  isVerified Boolean @default(false) // Verified purchase
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
}

// Wishlist
model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

// Store Settings
model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
}

// Service Areas (Supported Delivery Locations)
model ServiceArea {
  id              String    @id @default(cuid())
  name            String    @unique  // e.g., "Mirema", "Roysambu"
  slug            String    @unique  // e.g., "mirema", "roysambu"
  description     String?
  deliveryFee     Decimal   @db.Decimal(10, 2)
  minOrderAmount  Decimal   @db.Decimal(10, 2) @default(500)
  estimatedTime   String    // e.g., "30-60 mins"
  sortOrder       Int       @default(0)
  isActive        Boolean   @default(true)
  addresses       Address[]
  orders          Order[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Area Requests (for unsupported locations)
model AreaRequest {
  id          String   @id @default(cuid())
  areaName    String
  email       String?
  phone       String?
  requestCount Int     @default(1)  // Track demand
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([areaName])
}
```

---

## API Endpoints

### Products
```
GET    /api/products              # List products (with pagination, filters)
GET    /api/products/[slug]       # Get product by slug
GET    /api/products/featured     # Get featured products
GET    /api/products/search       # Search products
POST   /api/products              # Create product (admin)
PUT    /api/products/[id]         # Update product (admin)
DELETE /api/products/[id]         # Delete product (admin)
```

### Categories
```
GET    /api/categories            # List categories
GET    /api/categories/[slug]     # Get category with products
POST   /api/categories            # Create category (admin)
PUT    /api/categories/[id]       # Update category (admin)
DELETE /api/categories/[id]       # Delete category (admin)
```

### Service Areas
```
GET    /api/service-areas              # List all active service areas
GET    /api/service-areas/[slug]       # Get area details (fee, min order, etc.)
GET    /api/service-areas/check        # Check if area name is supported
POST   /api/service-areas              # Create service area (admin)
PUT    /api/service-areas/[id]         # Update service area (admin)
DELETE /api/service-areas/[id]         # Delete/deactivate area (admin)
POST   /api/service-areas/request      # Request new area (public)
GET    /api/admin/area-requests        # List area requests (admin)
```

### Cart
```
GET    /api/cart                  # Get user cart
POST   /api/cart                  # Add item to cart
PUT    /api/cart/[itemId]         # Update cart item quantity
DELETE /api/cart/[itemId]         # Remove item from cart
DELETE /api/cart                  # Clear cart
```

### Orders
```
GET    /api/orders                # List user orders
GET    /api/orders/[id]           # Get order details
POST   /api/orders                # Create order
PUT    /api/orders/[id]/status    # Update order status (admin)
POST   /api/orders/[id]/cancel    # Cancel order
```

### User
```
GET    /api/user/profile          # Get user profile
PUT    /api/user/profile          # Update profile
GET    /api/user/addresses        # List addresses
POST   /api/user/addresses        # Add address
PUT    /api/user/addresses/[id]   # Update address
DELETE /api/user/addresses/[id]   # Delete address
```

### Auth
```
POST   /api/auth/register         # Register
POST   /api/auth/login            # Login
POST   /api/auth/logout           # Logout
POST   /api/auth/forgot-password  # Request password reset
POST   /api/auth/reset-password   # Reset password
POST   /api/auth/verify-email     # Verify email
```

### Payments
```
POST   /api/payments/mpesa/initiate    # Initiate M-Pesa STK push
POST   /api/payments/mpesa/callback    # M-Pesa callback
GET    /api/payments/[orderId]/status  # Check payment status
```

### Admin
```
GET    /api/admin/dashboard       # Dashboard stats
GET    /api/admin/orders          # All orders
GET    /api/admin/customers       # All customers
GET    /api/admin/inventory       # Inventory report
GET    /api/admin/reports/sales   # Sales report
```

---

## Third-Party Integrations

### Payment Gateways

#### M-Pesa (Safaricom)
- **Provider:** Daraja API
- **Features:** STK Push, C2B, B2C
- **Use Case:** Primary payment method for Kenya
- **Docs:** https://developer.safaricom.co.ke/

#### Card Payments (Optional)
- **Provider:** Flutterwave / Paystack / Stripe
- **Features:** Card payments, mobile money
- **Use Case:** Alternative payment option

### SMS Notifications
- **Provider:** Africa's Talking
- **Use Cases:**
  - Order confirmation
  - Delivery updates
  - OTP verification
  - Marketing (opt-in)
- **Docs:** https://africastalking.com/

### Email Service
- **Provider:** Resend / SendGrid
- **Use Cases:**
  - Welcome emails
  - Order confirmations
  - Password reset
  - Marketing newsletters

### Maps & Location
- **Provider:** Google Maps API
- **Use Cases:**
  - Delivery address validation
  - Delivery tracking
  - Store locator

### Analytics
- **Provider:** Google Analytics / Mixpanel / PostHog
- **Track:**
  - Page views
  - Conversion funnel
  - User behavior
  - Revenue

### Image Optimization
- **Provider:** Cloudinary
- **Features:**
  - Image upload
  - Automatic optimization
  - Responsive images
  - Transformations

---

## Security Considerations

### Authentication
- [ ] Secure password hashing (bcrypt/argon2)
- [ ] JWT with short expiry + refresh tokens
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] Email verification
- [ ] Phone verification (OTP)

### Data Protection
- [ ] HTTPS everywhere
- [ ] Input validation & sanitization
- [ ] SQL injection prevention (ORM)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure headers (helmet)
- [ ] Environment variables for secrets

### Payment Security
- [ ] Never store card details
- [ ] Validate M-Pesa callbacks
- [ ] Idempotent payment processing
- [ ] Transaction logging

### Admin Security
- [ ] Role-based access control
- [ ] Admin action audit logs
- [ ] Two-factor authentication
- [ ] IP whitelisting (optional)

### API Security
- [ ] Rate limiting
- [ ] Request validation
- [ ] CORS configuration
- [ ] API versioning

---

## Development Phases

### Phase 1: MVP (Core Shopping Experience)
**Goal:** Launch basic shopping functionality for supported areas

- [ ] Project setup & configuration
- [ ] Database schema & migrations
- [ ] **Service area system**
  - [ ] Service area data model & seed data
  - [ ] Area selector component (header)
  - [ ] "Check your area" widget
  - [ ] Delivery areas page with list
  - [ ] Area validation throughout checkout
  - [ ] Dynamic delivery fee calculation
  - [ ] Minimum order validation per area
- [ ] Authentication (email + password)
- [ ] Product catalog
  - [ ] Product listing page
  - [ ] Product detail page
  - [ ] Category pages
  - [ ] Basic search
- [ ] Shopping cart
  - [ ] Add/remove items
  - [ ] Update quantities
  - [ ] Cart persistence
  - [ ] Show delivery fee based on selected area
- [ ] Checkout flow
  - [ ] **Area selection/validation**
  - [ ] Delivery information (address within area)
  - [ ] M-Pesa payment integration
  - [ ] Order confirmation
- [ ] Basic admin panel
  - [ ] Product management
  - [ ] Order management
  - [ ] Category management
  - [ ] **Service area management (CRUD)**

### Phase 2: Enhanced Features
**Goal:** Improve user experience

- [ ] Advanced search & filters
- [ ] User accounts
  - [ ] Registration
  - [ ] Profile management
  - [ ] Address book (validated against service areas)
  - [ ] Order history
- [ ] Wishlist/favorites
- [ ] Product reviews & ratings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Promo codes & discounts (can be area-specific)
- [ ] **Service area enhancements**
  - [ ] Area request form (for unsupported areas)
  - [ ] Notify when area becomes available
  - [ ] Service area map visualization
  - [ ] Sales reports by area
- [ ] Improved admin dashboard
  - [ ] Analytics & reports
  - [ ] Inventory alerts
  - [ ] Customer management
  - [ ] Area demand analytics (from requests)

### Phase 3: Growth Features
**Goal:** Scale and optimize

- [ ] Phone authentication (OTP)
- [ ] Social login (Google)
- [ ] Delivery slot scheduling
- [ ] Real-time order tracking
- [ ] Product recommendations
- [ ] Recently viewed products
- [ ] Reorder functionality
- [ ] Multiple payment options
- [ ] Bulk product import
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] PWA support

### Phase 4: Advanced (Future)
**Goal:** Expand capabilities and coverage

- [ ] **Expand to new service areas**
  - [ ] Data-driven expansion (based on area requests)
  - [ ] Automated area onboarding
  - [ ] Area-specific promotions for launches
- [ ] Mobile app (React Native)
- [ ] Delivery personnel app
- [ ] Subscription/recurring orders
- [ ] Loyalty program
- [ ] Multi-store support (different stores for different zones)
- [ ] Advanced analytics
- [ ] A/B testing
- [ ] Customer support chat
- [ ] Inventory management system

---

## Getting Started

### Prerequisites
- Node.js 18+
- Bun / npm / yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fnms.git
cd fnms

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
bun prisma migrate dev

# Seed initial data (includes service areas)
bun prisma db seed

# Start development server
bun dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# M-Pesa
MPESA_CONSUMER_KEY=""
MPESA_CONSUMER_SECRET=""
MPESA_PASSKEY=""
MPESA_SHORTCODE=""
MPESA_CALLBACK_URL=""

# SMS (Africa's Talking)
AT_API_KEY=""
AT_USERNAME=""

# Email (Resend)
RESEND_API_KEY=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Google Maps
GOOGLE_MAPS_API_KEY=""
```

---

## Project Structure

```
fnms/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── ...
│   ├── (shop)/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── delivery-areas/   # Service area pages
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── ...
│   ├── account/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── addresses/
│   │   └── ...
│   ├── admin/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── categories/
│   │   ├── service-areas/   # Manage delivery areas
│   │   ├── area-requests/   # View expansion requests
│   │   └── ...
│   ├── api/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── ...
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, Footer, Sidebar
│   ├── service-areas/   # Area selector, checker, map
│   ├── products/        # Product cards, grids
│   ├── cart/            # Cart components
│   ├── checkout/        # Checkout components (with area validation)
│   └── admin/           # Admin components
├── lib/
│   ├── db.ts         # Database client
│   ├── auth.ts       # Auth configuration
│   ├── utils.ts      # Utility functions
│   └── validations/  # Zod schemas
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
├── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts           # Seeds service areas + sample data
│   └── service-areas.ts  # Initial service area data
├── public/
└── ...
```

---

## License

Private - All rights reserved

---

## Contact

For questions or support:
- Email: support@fmns.co.ke
- Phone: 0721530181
