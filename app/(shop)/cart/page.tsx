import Link from "next/link";
import { CartPageClient } from "./cart-page-client";

export const metadata = {
  title: "Cart | FnM's Mini Mart",
  description: "Your shopping cart at FnM's Mini Mart.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:border-primary/30 active:scale-[0.98]"
        >
          <span aria-hidden>←</span>
          Back to homepage
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
        <CartPageClient />
      </main>
    </div>
  );
}
