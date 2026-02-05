import { Header } from "@/components/layout/header";
import { CartPageClient } from "./cart-page-client";

export const metadata = {
  title: "Cart | FnM's Mini Mart",
  description: "Your shopping cart at FnM's Mini Mart.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
        <CartPageClient />
      </main>
    </div>
  );
}
