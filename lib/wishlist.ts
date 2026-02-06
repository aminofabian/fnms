export const WISHLIST_CHANGED_EVENT = "fnms-wishlist-changed";

/**
 * Call after add/remove from wishlist so header count and wishlist list update in realtime.
 */
export function invalidateWishlist() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WISHLIST_CHANGED_EVENT));
  }
}
