"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Search,
  MapPin,
  ShoppingCart,
  Truck,
  Heart,
  Wallet,
  Menu,
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
    <>
      {/* Mobile: input + orange search button */}
      <form onSubmit={handleSubmit} className="flex w-full gap-0 lg:hidden">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for products"
          className="flex-1 rounded-l-md border border-r-0 border-[var(--nav-green)]/50 bg-white py-3 pl-4 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-r-md bg-primary text-primary-foreground"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
      {/* Desktop: inline search */}
      <form onSubmit={handleSubmit} className="relative hidden w-full max-w-xl flex-1 px-6 lg:block">
        <Search className="absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for products"
          className="w-full rounded-md border border-border bg-input py-2.5 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>
    </>
  );
}

function HeaderAuthNav() {
  const { data: session } = useSession();

  return session ? (
    <Link
      href="/account"
      className="flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-primary/10 lg:flex lg:h-auto lg:w-auto lg:gap-1.5 lg:rounded-md lg:px-3 lg:py-2 lg:text-foreground lg:hover:bg-accent"
    >
      <User className="h-6 w-6 shrink-0 lg:h-5 lg:w-5" />
      <span className="hidden text-sm lg:inline">{session.user?.name || "Account"}</span>
    </Link>
  ) : (
    <Link
      href="/login"
      className="flex h-10 w-10 items-center justify-center rounded-md text-primary hover:bg-primary/10 lg:flex lg:h-auto lg:w-auto lg:gap-1.5 lg:rounded-md lg:px-3 lg:py-2 lg:text-foreground lg:hover:bg-accent"
    >
      <User className="h-6 w-6 shrink-0 lg:h-5 lg:w-5" />
      <span className="hidden text-sm lg:inline">Sign in / register</span>
    </Link>
  );
}

function CartSummary() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());
  const savedCents = useCartStore((s) => s.getSavedCents());

  return (
    <>
      {/* Mobile: orange box */}
      <Link
        href="/cart"
        className="flex flex-1 items-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-95 lg:hidden"
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold">
            KES {((Number(subtotalCents) || 0) / 100).toLocaleString()}
          </span>
          <span className="text-[10px] text-primary-foreground/80">
            Saved {((Number(savedCents) || 0) / 100).toLocaleString()}
          </span>
        </div>
      </Link>
      {/* Desktop: compact */}
      <Link
        href="/cart"
        className="hidden items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent lg:flex lg:px-3 lg:py-2"
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-primary">
            KES {((Number(subtotalCents) || 0) / 100).toLocaleString()}
          </div>
          <span className="inline-block rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Saved {((Number(savedCents) || 0) / 100).toLocaleString()}
          </span>
        </div>
      </Link>
    </>
  );
}

function WalletBal() {
  return (
    <>
      <div
        className="flex flex-1 flex-col rounded-lg px-4 py-3 text-white lg:hidden"
        style={{ backgroundColor: "var(--nav-green)" }}
      >
        <span className="flex items-center gap-1 text-[10px] text-white/90">Wallet Bal</span>
        <span className="text-sm font-semibold">KES 0.00</span>
      </div>
      <div className="hidden flex-col rounded-md px-2 py-1.5 text-left lg:flex lg:px-3 lg:py-2">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          Wallet Bal
        </span>
        <span className="text-xs font-semibold text-foreground">KES 0.00</span>
      </div>
    </>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 flex flex-col bg-white">
      {/* Top promo bar — hidden on mobile */}
      <div
        className="hidden items-center justify-between px-4 py-2 text-sm text-white lg:flex"
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
            <span>Reorder My Items</span>
          </Link>
          <a href="tel:+254721530181" className="hover:underline">
            +254 721 530 181
          </a>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 lg:hidden">
        {/* Row 1: Hamburger | Logo | User */}
        <div className="flex items-center justify-between">
          <Link
            href="/categories"
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
          >
            <Menu className="h-6 w-6" />
          </Link>
          <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-90">
            <Image
              src="/fnms.png"
              alt="FnM's - saves you money"
              width={120}
              height={120}
              unoptimized
              className="h-10 w-auto"
              priority
            />
          </Link>
          {mounted ? (
            <HeaderAuthNav />
          ) : (
            <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
          )}
        </div>
        {/* Row 2: Location + Change */}
        <AreaSelector />
        {/* Row 3: Search */}
        <HeaderSearch />
        {/* Row 4: Wallet + Cart */}
        <div className="flex gap-2">
          <WalletBal />
          <CartSummary />
        </div>
      </div>

      {/* Desktop: compact single row */}
      <div className="hidden lg:relative lg:flex lg:h-12 lg:items-center lg:justify-between lg:gap-2 lg:border-b lg:border-border lg:bg-card lg:px-4">
        <Link
          href="/"
          className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <Image
            src="/fnms.png"
            alt="FnM's - saves you money"
            width={120}
            height={120}
            unoptimized
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="w-32 shrink-0" aria-hidden />
        <HeaderSearch />
        <div className="flex shrink-0 items-center gap-2">
          <AreaSelector />
          <WalletBal />
          <CartSummary />
          {mounted ? (
            <HeaderAuthNav />
          ) : (
            <div className="h-9 w-16 animate-pulse rounded-md bg-muted" aria-hidden />
          )}
        </div>
      </div>
    </header>
  );
}
