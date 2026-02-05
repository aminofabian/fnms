"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Search,
  MapPin,
  ChevronDown,
  ShoppingCart,
  Truck,
  LayoutGrid,
  Heart,
  Percent,
  ShoppingBag,
  Leaf,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { AreaSelector } from "@/components/service-areas/area-selector";
import { useCartStore } from "@/stores/cart-store";

function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-xl flex-1 px-4 lg:px-6"
    >
      <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground lg:left-10" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for products"
        className="w-full rounded-md border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:pl-12"
      />
    </form>
  );
}

function HeaderAuthNav() {
  const { data: session } = useSession();

  return session ? (
    <Link
      href="/account"
      className="flex flex-col items-center gap-0 rounded-md px-2 py-1.5 text-center text-xs hover:bg-accent sm:flex-row sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
    >
      <User className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline">{session.user?.name || "Account"}</span>
    </Link>
  ) : (
    <Link
      href="/login"
      className="flex flex-col items-center gap-0 rounded-md px-2 py-1.5 text-center text-xs hover:bg-accent sm:flex-row sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
    >
      <User className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline">Sign in / register</span>
      <span className="sm:hidden">Sign in</span>
    </Link>
  );
}

function CartSummary() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());

  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent sm:px-3 sm:py-2"
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5 text-foreground" />
        {itemCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </div>
      <div className="hidden text-left sm:block">
        <div className="text-xs font-semibold text-primary">
          KES {(subtotalCents / 100).toLocaleString()}
        </div>
        <span className="inline-block rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          Saved 0
        </span>
      </div>
    </Link>
  );
}

function WalletBal() {
  return (
    <div className="hidden flex-col rounded-md px-2 py-1.5 text-left sm:flex lg:px-3 lg:py-2">
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Wallet className="h-3.5 w-3.5" />
        Wallet Bal
      </span>
      <span className="text-xs font-semibold text-foreground">KES 0.00</span>
    </div>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 flex flex-col shadow-sm">
      {/* Top promo bar — dark green */}
      <div
        className="flex items-center justify-between px-4 py-2 text-sm text-white"
        style={{ backgroundColor: "var(--nav-green)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white/90" aria-hidden>►</span>
          <Truck className="h-4 w-4" aria-hidden />
          <span>Save more with FREE delivery</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 hover:underline"
          >
            <Heart className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Reorder My Items</span>
            <span className="sm:hidden">Reorder</span>
          </Link>
          <a href="tel:+254700000000" className="hover:underline">
            +254 700 000 000
          </a>
        </div>
      </div>

      {/* Main header — white */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 flex-col rounded-md border-2 border-primary px-2.5 py-1.5 sm:px-3 sm:py-2"
        >
          <span className="text-lg font-bold tracking-tight text-primary sm:text-xl">
            FnM&apos;s
          </span>
          <span className="text-[10px] font-medium text-primary sm:text-xs">
            saves you money
          </span>
        </Link>

        <HeaderSearch />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <AreaSelector />
          <CartSummary />
          <WalletBal />
          {mounted ? (
            <HeaderAuthNav />
          ) : (
            <div className="h-9 w-16 animate-pulse rounded-md bg-muted" aria-hidden />
          )}
        </div>
      </div>

      {/* Nav bar — dark green, white links */}
      <nav
        className="flex flex-wrap items-center gap-0.5 px-4 py-2 text-white"
        style={{ backgroundColor: "var(--nav-green)" }}
      >
        <Link
          href="/categories"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden />
          Categories
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10"
        >
          <Percent className="h-4 w-4" aria-hidden />
          Promos
          <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </Link>
        <Link
          href="/categories"
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Products
          <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </Link>
        <Link
          href="/categories"
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10"
        >
          <Leaf className="h-4 w-4" aria-hidden />
          Fresh
          <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </Link>
        <Link
          href="/delivery-areas"
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10"
        >
          Delivery
          <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </Link>
      </nav>
    </header>
  );
}
