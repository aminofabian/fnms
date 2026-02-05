import { WishlistList } from "@/components/wishlist";

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
      <WishlistList />
    </div>
  );
}
