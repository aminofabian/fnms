# Wallet & Payments Implementation Plan

This document breaks down how to add an in-app **wallet** (user balance in KES) and use it as a payment method at checkout. It fits alongside your existing **Paystack** (M-Pesa/card) and **Cash on Delivery** flows.

---

## Overview

- **Wallet** = per-user balance stored in the DB (in **cents**), with an audit log of transactions.
- **Payments with wallet** = at checkout, user can choose “Pay with Wallet” if balance ≥ order total; balance is deducted when the order is created.
- **Optional**: “Top up wallet” via Paystack so users can fund their balance and pay from it later.

---

## Step 1: Database schema for wallet

**Goal:** Store balance per user and a transaction history for audit and debugging.

1. **Create a migration** (e.g. `sql/migrations/003_wallet.sql`):
   - **Option A – column on `users`**  
     - Add `wallet_balance_cents INTEGER NOT NULL DEFAULT 0` to `users`.  
     - Simple; good if you only ever have one “wallet” per user.
   - **Option B – separate `wallets` table**  
     - `wallets (id, user_id UNIQUE, balance_cents, currency, updated_at)`.  
     - Better if you might support multiple currencies or wallet types later.

2. **Create `wallet_transactions` table** (recommended either way):
   - Columns: `id`, `user_id`, `type` (e.g. `'top_up' | 'order_payment' | 'refund' | 'adjustment'`), `amount_cents` (signed: positive = credit, negative = debit), `reference_type` (e.g. `'order' | 'paystack'`), `reference_id` (e.g. order_id or payment ref), `balance_after_cents`, `created_at`, optional `description`.
   - Indexes: `user_id`, `created_at`, and optionally `(reference_type, reference_id)` for idempotency.

3. **Run the migration** against your Turso DB (e.g. `turso db shell <db-name> < sql/migrations/003_wallet.sql` or run statements in Turso dashboard).

**Deliverables:** Migration file, migration applied. No app code yet.

---

## Step 2: Wallet API – balance and transactions

**Goal:** Let the frontend (and other server code) read balance and history safely.

1. **GET `/api/wallet`** (or `/api/user/wallet`):
   - Require auth (session).
   - Return `{ balanceCents: number, currency: 'KES' }` (and optionally last N transactions).
   - Read from `users.wallet_balance_cents` or `wallets.balance_cents`.

2. **GET `/api/wallet/transactions`** (optional but useful):
   - Require auth.
   - Query params: `page`, `limit`.
   - Return paginated list of wallet_transactions for the current user (type, amount_cents, balance_after_cents, reference_type, reference_id, created_at, description).

3. **Shared server helper** (e.g. `lib/wallet.ts`):
   - `getWalletBalance(userId): Promise<number>` – returns balance in cents.
   - `recordTransaction(userId, { type, amountCents, referenceType?, referenceId?, description? }): Promise<void>` – updates balance (in a transaction with row lock) and inserts into `wallet_transactions` with `balance_after_cents`. Use this for all balance changes so you never update balance without a transaction row.

**Deliverables:** `lib/wallet.ts`, `app/api/wallet/route.ts`, optional `app/api/wallet/transactions/route.ts`.

---

## Step 3: Deduct from wallet (server-side helper)

**Goal:** Single place that deducts from wallet and records the transaction; used when an order is paid with wallet.

1. In `lib/wallet.ts` add:
   - `deductForOrder(userId, orderId, totalCents, description?): Promise<{ ok: boolean; error?: string }>`:
     - In a DB transaction (or serialized per user): read current balance, check `balance >= totalCents`, then subtract and call `recordTransaction` with type `'order_payment'`, negative amount, `reference_type: 'order'`, `reference_id: orderId`.
     - Return `{ ok: true }` or `{ ok: false, error: 'Insufficient balance' }` (or similar).

2. **Idempotency:** If the same order might ever be applied twice (e.g. retries), check in `recordTransaction` or in `deductForOrder` that you don’t already have a `wallet_transactions` row for `reference_type = 'order'` and `reference_id = orderId` for that user. If exists, return success without deducting again.

**Deliverables:** `deductForOrder` in `lib/wallet.ts`, with transaction log and idempotency.

---

## Step 4: Orders API – accept WALLET and deduct

**Goal:** Checkout can choose “Wallet”; creating the order deducts balance and marks payment as paid.

1. **Extend payment method type** in the orders API:
   - Accept `paymentMethod: "PAYSTACK" | "CASH_ON_DELIVERY" | "WALLET"`.

2. **Validation for WALLET:**
   - Require authenticated user (no guest wallet payment).
   - Get `totalCents` (subtotal + delivery fee, after any promo) and user’s wallet balance.
   - If `balanceCents < totalCents`, return 400 with a clear message (e.g. “Insufficient wallet balance. Top up or choose another payment method.”).

3. **Order creation when payment is WALLET:**
   - Create the order as you do today (same INSERT), with `payment_method = 'WALLET'` and `payment_status = 'paid'` (since you’re deducting immediately).
   - **After** the order (and order_items) are created, call `deductForOrder(userId, orderId, totalCents)`.
   - If `deductForOrder` returns `ok: false`, roll back the order (or delete the order and return 400). Never leave an order in “paid” state without a successful deduction.

4. **Edge case:** If two requests run at once for the same user, ensure deduct is done inside a transaction that locks the user’s wallet row (or uses a single UPDATE with a WHERE balance >= totalCents) so you don’t over-deduct.

**Deliverables:** Orders POST accepts `WALLET`, validates balance, creates order with `payment_status = 'paid'`, and deducts via `deductForOrder` with rollback on failure.

---

## Step 5: Checkout store and types – add WALLET

**Goal:** UI and types know about the third payment method.

1. **Types** (`types/checkout.ts`):
   - Change: `PaymentMethod = "PAYSTACK" | "CASH_ON_DELIVERY" | "WALLET"`.

2. **Checkout store** (`stores/checkout-store.ts`):
   - No structural change; it already stores `paymentMethod`. Optionally set a sensible default when wallet is available (e.g. still default to `CASH_ON_DELIVERY` or `PAYSTACK`; you can later prefer WALLET when balance is sufficient).

**Deliverables:** Updated type and store (if you change default).

---

## Step 6: Checkout UI – show Wallet option and balance

**Goal:** User can select “Pay with Wallet” and see their balance so they know they can afford the order.

1. **Fetch wallet balance on checkout (payment step):**
   - When the user is on the payment step (or when the checkout page loads and user is logged in), call `GET /api/wallet` and store `balanceCents` in component state or in the checkout store.

2. **Payment method component** (`components/checkout/payment-method.tsx`):
   - Add a third option: `WALLET` with label “Wallet” and description like “Pay from your wallet balance”.
   - Show current balance next to it (e.g. “Balance: KES 1,234.00”).
   - If `balanceCents < orderTotalCents`, either hide the Wallet option or show it disabled with “Insufficient balance (top up or use another method)”.
   - Ensure `orderTotalCents` is the same as what the server will use (subtotal + delivery fee, minus any promo).

3. **Checkout page** (`app/(shop)/checkout/page.tsx`):
   - Pass `orderTotalCents` (and optionally `walletBalanceCents`) into `PaymentMethod`.
   - When placing order with `paymentMethod === "WALLET"`, don’t call Paystack; call `POST /api/orders` with `paymentMethod: "WALLET"` and then redirect to success page (same as cash on delivery flow).

**Deliverables:** Wallet option in payment step, balance displayed, order total compared, place order with WALLET without redirecting to Paystack.

---

## Step 7: Display wallet in header/account (optional but recommended)

**Goal:** Users see their balance outside checkout (e.g. in header or account menu).

1. **Header / account dropdown:**
   - For logged-in users, call `GET /api/wallet` (or use a small hook that caches it) and show “Wallet: KES X.XX” or an icon + balance.
   - Link to a wallet/account page if you have one.

2. **Account / profile page:**
   - Add a “Wallet” section: current balance and a link to “Transaction history” (and later “Top up”).

**Deliverables:** Balance visible in header or account; optional wallet section on account page.

---

## Step 8: Wallet page – balance + transaction history (optional)

**Goal:** Dedicated page where users see balance and past transactions.

1. **Page:** e.g. `app/(shop)/account/wallet/page.tsx` (or under `/profile`, depending on your routes).
   - Show current balance (from `GET /api/wallet`).
   - List recent transactions from `GET /api/wallet/transactions` (type, amount, date, description/reference).

2. **Optional:** “Top up” button that links to the top-up flow (Step 9).

**Deliverables:** Wallet page with balance and transaction list.

---

## Step 9: Top up wallet via Paystack (optional)

**Goal:** Users can add funds to the wallet; then use wallet at checkout.

1. **API:** `POST /api/wallet/top-up`:
   - Body: `{ amountCents: number }` (and maybe min/max limits).
   - Require auth. Validate amount (e.g. min 100 KES, max 50,000 KES).
   - Create a “pending” wallet top-up record (e.g. in a `wallet_top_ups` table with `user_id`, `amount_cents`, `status: 'pending'`, `paystack_reference`, `created_at`), or use a generic “pending_transaction” approach.
   - Call Paystack “initialize” (similar to your existing Paystack flow) with the amount and a unique reference; store the reference in the top-up record.
   - Return `{ authorization_url }` for the client to redirect.

2. **Webhook:** In your existing Paystack webhook (or a dedicated one for top-ups):
   - When payment is successful, identify that it’s a wallet top-up (e.g. by metadata or reference prefix).
   - Load the top-up record by Paystack reference; if status is still `pending`, call `recordTransaction(userId, { type: 'top_up', amountCents, referenceType: 'paystack', referenceId: paystackRef })`, then mark top-up as `completed`. Use idempotency (e.g. don’t credit twice for the same Paystack reference).

3. **Success page:** After redirect from Paystack, show “Wallet topped up with KES X.XX” and link to wallet page or checkout.

**Deliverables:** Top-up API, webhook handling for top-up, success UX; optional “Top up” button on wallet page and checkout when balance is low.

---

## Step 10: Refunds back to wallet (optional, later)

**Goal:** When an order is refunded, optionally credit the wallet instead of (or in addition to) other refund methods.

1. In your order refund flow (admin or support):
   - If original `payment_method === 'WALLET'`, call `recordTransaction(userId, { type: 'refund', amountCents: orderTotalCents, referenceType: 'order', referenceId: orderId, description: 'Refund for order #...' })`.
   - Ensure idempotency (one refund per order).

**Deliverables:** Refund logic that credits wallet when the order was paid with wallet.

---

## Summary checklist

| Step | What | Required? |
|------|------|-----------|
| 1 | DB: wallet balance + wallet_transactions | Yes |
| 2 | API: GET balance (and transactions) + lib/wallet helpers | Yes |
| 3 | lib/wallet: deductForOrder + idempotency | Yes |
| 4 | Orders API: accept WALLET, validate balance, deduct, set payment_status | Yes |
| 5 | Types + store: PaymentMethod includes WALLET | Yes |
| 6 | Checkout UI: Wallet option, show balance, place order with WALLET | Yes |
| 7 | Header/account: show wallet balance | Recommended |
| 8 | Wallet page: balance + history | Optional |
| 9 | Top up via Paystack + webhook | Optional |
| 10 | Refunds to wallet | Optional (later) |

---

## Order of implementation

- **Minimum to “pay with wallet”:** 1 → 2 → 3 → 4 → 5 → 6. (Balance can be seeded or credited manually for testing; top-up can come later.)
- **Better UX:** add 7 and 8 so users can see balance and history.
- **Full loop:** add 9 (top-up) and 10 (refunds) when you’re ready.

If you want, next we can turn this into concrete tasks (e.g. file-by-file) or start with the migration and `lib/wallet.ts` implementation.
