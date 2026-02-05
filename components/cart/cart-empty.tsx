import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center">
      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold text-foreground">Your cart is empty</h2>
      <p className="mt-2 text-muted-foreground">
        Add items from the shop to get started.
      </p>
      <Link
        href="/products"
        className="mt-6 rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90"
      >
        Browse products
      </Link>
    </div>
  );
}
