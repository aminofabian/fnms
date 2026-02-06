# Wishlist Implementation Plan

This document describes the **current wishlist feature** and a step-by-step plan for **enhancements**. The core wishlist (add/remove, list page, API) is already in place; the plan focuses on polish, discovery, and optional advanced behaviour.

---

## Current state (already implemented)

- **Database:** `wishlists` table (`id`, `user_id`, `product_id`, `created_at`) with `UNIQUE(user_id, product_id)` and index on `user_id`.
- **API:**
  - `GET /api/wishlist` – list wishlist items with product details (auth required).
  - `POST /api/wishlist` – add product by `productId` (auth required).
  - `GET /api/wishlist/[productId]` – check if product is in wishlist (`{ inWishlist: boolean }`).
  - `DELETE /api/wishlist/[productId]` – remove from wishlist (auth required).
- **UI:**
  - `WishlistButton` – used on **deals carousel** and **product detail page**; unauthenticated users are sent to login.
  - `WishlistList` + `WishlistItem` – list with image, name, price, “Add to Cart”, remove.
  - Account page: **My Wishlist** at `/account/wishlist` (linked from account layout).
- **Behaviour:** Auth-only; no guest wishlist, no wishlist count in header, no wishlist icon in main nav.

---

## Overview of planned enhancements

- **Discovery:** Wishlist icon + count in header/nav; ensure wishlist button on all product surfaces.
- **UX polish:** Toasts on add/remove; optional optimistic updates; loading/error states.
- **Bulk actions:** “Add all to cart” and “Clear wishlist” on the wishlist page.
- **Optional (later):** Guest wishlist (localStorage) with merge on login; share list; “You might like” on empty state.

---

## Step 1: Header / nav – wishlist link and count

**Goal:** Users can open the wishlist from the header and see how many items they have.

1. **Wishlist count (server or client):**
   - **Option A:** Add `GET /api/wishlist/count` that returns `{ count: number }` (auth required; 0 if not logged in or empty). Header calls it when mounted (or on session change) and shows the count.
   - **Option B:** Use existing `GET /api/wishlist` and derive count from `items.length` (simpler but heavier if list is long; consider `?countOnly=true` or a dedicated count endpoint).

2. **Header component** (`components/layout/header.tsx`):
   - Add a wishlist link (e.g. Heart icon) next to cart, visible when the user is logged in.
   - Link to `/account/wishlist`.
   - Show a badge with count when `count > 0` (reuse pattern from `CartSummary`).
   - Use a small hook (e.g. `useWishlistCount()`) that fetches count on mount and optionally refetches after add/remove (or after a global “wishlist changed” event).

3. **Optional:** In the account layout sidebar, show the count next to “Wishlist” (e.g. “Wishlist (3)”).

**Deliverables:** `GET /api/wishlist/count` (or count from existing API), `useWishlistCount` hook (optional), header wishlist link with count badge.

---

## Step 2: Wishlist button on all product surfaces

**Goal:** Users can add to wishlist from every product card, not only deals and PDP.

1. **Product grid** (`components/home/product-grid.tsx` or shared product card):
   - Add `WishlistButton` to each product card (same pattern as deals carousel: `productId={product.id}`, `size="sm"`).
   - Ensure layout doesn’t break on small screens (e.g. icon-only button).

2. **Category / search / other listing pages:**
   - If they use the same `ProductGrid` (or a shared product card component), the wishlist button will appear there too. If they use a different component, add `WishlistButton` there as well.

**Deliverables:** `WishlistButton` on product grid and any other product listing components.

---

## Step 3: Toasts and optional optimistic updates

**Goal:** Clear feedback when adding or removing from wishlist; optionally instant UI update.

1. **Toasts:**
   - In `WishlistButton`: after successful add, show toast (e.g. “Added to wishlist”); after remove, “Removed from wishlist”. Use your existing toast system (e.g. Sonner).
   - In `WishlistList` / `WishlistItem`: after remove, optional toast “Removed from wishlist”.

2. **Optimistic updates (optional):**
   - In `WishlistButton`: set `inWishlist` to the new value immediately on click; on API failure, revert and show error toast.
   - In `WishlistList`: remove item from local state immediately on “Remove”; on API failure, re-add and show error toast.

**Deliverables:** Toasts on add/remove; optional optimistic toggle in button and list.

---

## Step 4: Wishlist page – bulk actions

**Goal:** “Add all to cart” and “Clear wishlist” on the wishlist page.

1. **Add all to cart:**
   - Button at top of wishlist list (e.g. “Add all to cart”). Only include in-stock and active products; optionally show “X of Y items added” or disable out-of-stock in the count.
   - On click: for each item, call cart store `addItem` (or sync with server cart via API). Then show toast “Added X items to cart” (and optionally “Y items out of stock”).

2. **Clear wishlist:**
   - Button “Clear wishlist” (or “Remove all”). Confirm with a simple modal or `confirm()`.
   - New API: `DELETE /api/wishlist` (no body) – deletes all wishlist entries for the current user. Or loop `DELETE /api/wishlist/[productId]` from the client (simpler, no new API).
   - After success: clear local state, show empty state, toast “Wishlist cleared”.

**Deliverables:** “Add all to cart” and “Clear wishlist” on wishlist page; optional `DELETE /api/wishlist` for clear-all.

---

## Step 5: Wishlist page metadata and empty state

**Goal:** Better SEO and a friendlier empty state.

1. **Metadata:**
   - In `app/account/wishlist/page.tsx` (or layout): set `title` and `description` (e.g. “My Wishlist | FnM's Mini Mart”, “Items you’ve saved for later.”).

2. **Empty state (optional):**
   - Already have “Your wishlist is empty” + “Start Shopping”. Optionally add a “You might like” section (e.g. featured or recently viewed products) to encourage browsing.

**Deliverables:** Wishlist page title/description; optional “You might like” block.

---

## Step 6: Guest wishlist (optional, later)

**Goal:** Let guests save items in the browser and merge into account wishlist on login.

1. **LocalStorage:**
   - Store guest wishlist as an array of `productId` in `localStorage` (e.g. key `fnms_wishlist_guest`).
   - When not logged in, `WishlistButton` reads/writes this list and shows filled heart; no redirect to login for add/remove.

2. **Merge on login:**
   - After successful login (or register), call an API (e.g. `POST /api/wishlist/merge`) with body `{ productIds: number[] }`. Server adds each ID to the user’s wishlist (ignore duplicates). Then clear guest list from localStorage.

3. **Count in header:**
   - For guests, show count from localStorage; for logged-in users, show count from API. After merge, refetch count.

**Deliverables:** Guest wishlist in localStorage, merge API, merge on login, header count for both guest and logged-in.

---

## Step 7: Share wishlist (optional, later)

**Goal:** Allow users to share a read-only link to their wishlist.

1. **Shareable link:**
   - Option A: Public slug (e.g. `/wishlist/[slug]`) where `slug` is a random token stored per user (e.g. in `users.wishlist_share_slug`). Page shows wishlist items (read-only) for that slug.
   - Option B: One-time or time-limited token in query param.

2. **API:** `GET /api/wishlist/shared/[slug]` – returns wishlist items for that slug (no auth). Only expose product name, image, slug, price (no user info).

3. **Account:** “Share wishlist” button that generates/copies link and optionally toggles “allow shared link” in settings.

**Deliverables:** Share slug/token, shared wishlist page, share button and copy-link UX.

---

## Summary checklist

| Step | What | Required? |
|------|------|-----------|
| 1 | Header/nav: wishlist link + count | Recommended |
| 2 | WishlistButton on all product grids/listings | Recommended |
| 3 | Toasts (and optional optimistic updates) | Recommended |
| 4 | Bulk: Add all to cart, Clear wishlist | Optional |
| 5 | Page metadata + optional “You might like” | Optional |
| 6 | Guest wishlist + merge on login | Optional (later) |
| 7 | Share wishlist (read-only link) | Optional (later) |

---

## Order of implementation

- **Quick wins:** 1 (header count + link) → 2 (button on product grid) → 3 (toasts). These make the wishlist visible and give clear feedback.
- **Page polish:** 4 (bulk actions) and 5 (metadata / empty state).
- **Advanced:** 6 (guest wishlist) and 7 (share) when you want to invest in them.

If you want, next we can turn this into concrete tasks (file-by-file) or implement Step 1 (header + count) first.
