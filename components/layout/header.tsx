"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Search,
  ShoppingCart,
  Truck,
  Heart,
  Wallet,
  Menu,
  Phone,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { AreaSelector } from "@/components/service-areas/area-selector";
import { useCartStore } from "@/stores/cart-store";
import { TopUpModal } from "@/components/wallet/top-up-modal";

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
      <form onSubmit={handleSubmit} className="flex w-full gap-0 lg:hidden" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for products"
          aria-label="Search for products"
          className="flex-1 rounded-l-lg border border-r-0 border-primary/30 bg-white py-3 pl-4 pr-3 text-sm placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-r-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
      {/* Desktop: inline search */}
      <form onSubmit={handleSubmit} className="relative hidden w-full max-w-xl flex-1 px-6 lg:block" role="search">
        <Search className="pointer-events-none absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for products"
          aria-label="Search for products"
          className="w-full rounded-lg border border-border bg-input py-2.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/30"
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
      aria-label="Account"
      className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] lg:text-foreground lg:hover:bg-accent"
    >
      <User className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden text-sm font-medium lg:inline">{session.user?.name || "Account"}</span>
    </Link>
  ) : (
    <Link
      href="/login"
      aria-label="Sign in or register"
      className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-primary transition-colors hover:bg-primary/10 active:scale-[0.98] lg:text-foreground lg:hover:bg-accent"
    >
      <User className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden text-sm font-medium lg:inline">Sign in / register</span>
    </Link>
  );
}

function CartSummary() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());
  const savedCents = useCartStore((s) => s.getSavedCents());

  return (
    <>
      {/* Mobile: orange CTA */}
      <Link
        href="/cart"
        aria-label={`Cart, ${itemCount} items`}
        className="flex flex-1 items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-sm transition-all hover:bg-primary/95 active:scale-[0.99] lg:hidden"
      >
        <div className="relative flex shrink-0">
          <ShoppingCart className="h-5 w-5" aria-hidden />
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-primary">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold">
            KES {((Number(subtotalCents) || 0) / 100).toLocaleString()}
          </span>
          {Number(savedCents) > 0 && (
            <span className="text-[10px] text-primary-foreground/85">
              Saved KES {((Number(savedCents) || 0) / 100).toLocaleString()}
            </span>
          )}
        </div>
      </Link>
      {/* Desktop: compact */}
      <Link
        href="/cart"
        aria-label={`Cart, ${itemCount} items`}
        className="hidden items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-accent active:scale-[0.98] lg:flex"
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5 text-foreground" aria-hidden />
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
          {Number(savedCents) > 0 && (
            <span className="inline-block rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Saved {((Number(savedCents) || 0) / 100).toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </>
  );
}

function WishlistSummary() {
  const { data: session } = useSession();
  const [count, setCount] = useState<number | null>(null);

  const refetch = useCallback(() => {
    if (!session?.user) return;
    fetch("/api/wishlist/count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        setCount(typeof data?.count === "number" ? data.count : 0);
      })
      .catch(() => setCount(0));
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) {
      setCount(null);
      return;
    }

    let cancelled = false;
    fetch("/api/wishlist/count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (cancelled) return;
        setCount(typeof data?.count === "number" ? data.count : 0);
      })
      .catch(() => {
        if (cancelled) return;
        setCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) return;
    const handler = () => refetch();
    window.addEventListener("fnms-wishlist-changed", handler);
    return () => window.removeEventListener("fnms-wishlist-changed", handler);
  }, [session?.user, refetch]);

  if (!session?.user) return null;

  const displayCount = typeof count === "number" ? count : 0;

  return (
    <>
      {/* Mobile: full-width button similar to cart */}
      <Link
        href="/account/wishlist"
        aria-label={`Wishlist, ${displayCount} items`}
        className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-foreground shadow-sm transition-all hover:bg-muted active:scale-[0.99] lg:hidden"
      >
        <div className="relative flex shrink-0">
          <Heart className="h-5 w-5" aria-hidden />
          {displayCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {displayCount > 99 ? "99+" : displayCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold">Wishlist</span>
          <span className="text-[11px] text-muted-foreground">
            {displayCount === 0 ? "No saved items yet" : "Saved items for later"}
          </span>
        </div>
      </Link>

      {/* Desktop: compact icon + label */}
      <Link
        href="/account/wishlist"
        aria-label={`Wishlist, ${displayCount} items`}
        className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-[0.98] lg:flex"
      >
        <div className="relative">
          <Heart className="h-4 w-4" aria-hidden />
          {displayCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {displayCount > 99 ? "99+" : displayCount}
            </span>
          )}
        </div>
        <span>Wishlist</span>
      </Link>
    </>
  );
}

function WalletBal() {
  const { data: session } = useSession();
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setBalanceCents(null);
      return;
    }
    fetch("/api/wallet")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { balanceCents?: number } | null) =>
        setBalanceCents(data?.balanceCents ?? null)
      )
      .catch(() => setBalanceCents(null));
  }, [session?.user?.id]);

  if (!session?.user) return null;

  const displayBalance =
    balanceCents !== null
      ? `KES ${((balanceCents ?? 0) / 100).toLocaleString()}`
      : "—";

  return (
    <>
      <button
        type="button"
        onClick={() => setTopUpModalOpen(true)}
        aria-label="Wallet balance - open to top up"
        className="flex flex-1 flex-col rounded-xl px-4 py-3 text-left text-white shadow-sm transition-opacity hover:opacity-95 active:scale-[0.99] lg:hidden"
        style={{ backgroundColor: "var(--nav-green)" }}
      >
        <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-white/90">
          Wallet
        </span>
        <span className="text-sm font-semibold">{displayBalance}</span>
      </button>
      <button
        type="button"
        onClick={() => setTopUpModalOpen(true)}
        aria-label="Wallet balance - open to top up"
        className="hidden flex-col rounded-lg border border-border bg-muted/50 px-3 py-2 text-left transition-colors hover:bg-muted lg:flex"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" aria-hidden />
          Wallet
        </span>
        <span className="text-xs font-semibold text-foreground">{displayBalance}</span>
      </button>
      <TopUpModal open={topUpModalOpen} onClose={() => setTopUpModalOpen(false)} />
    </>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex flex-col bg-card transition-shadow duration-200 ${scrolled ? "shadow-sm" : ""}`}
    >
      {/* Top promo bar — hidden on mobile */}
      <div
        className="hidden items-center justify-between gap-4 px-6 py-2.5 text-sm text-white lg:flex"
        style={{ backgroundColor: "var(--nav-green)" }}
      >
        <div className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
          <span className="font-medium">Save more with FREE delivery</span>
        </div>
        <nav className="flex items-center gap-6" aria-label="Quick links">
          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 transition-colors hover:text-white/90"
          >
            <Heart className="h-4 w-4 shrink-0" aria-hidden />
            <span>Reorder My Items</span>
          </Link>
          <a
            href="tel:+254721530181"
            className="flex items-center gap-1.5 transition-colors hover:text-white/90"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            <span>+254 721 530 181</span>
          </a>
        </nav>
      </div>

      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-4 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/categories"
            aria-label="Categories"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
          >
            <Menu className="h-6 w-6" aria-hidden />
          </Link>
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Image
              src="/fnms.png"
              alt="FnM's - saves you money"
              width={120}
              height={120}
              unoptimized
              className="h-[120px] w-auto"
              priority
            />
          </Link>
          {mounted ? (
            <HeaderAuthNav />
          ) : (
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" aria-hidden />
          )}
        </div>
        <AreaSelector />
        <HeaderSearch />
        <div className="flex gap-2">
          <WalletBal />
          <WishlistSummary />
          <CartSummary />
        </div>
      </div>

      {/* Desktop: single row */}
      <div className="hidden lg:relative lg:flex lg:min-h-[120px] lg:items-center lg:justify-between lg:gap-4 lg:border-b lg:border-border lg:bg-card lg:px-6">
        <Link
          href="/"
          className="absolute left-6 top-1/2 z-20 flex -translate-y-1/2 shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <Image
            src="/fnms.png"
            alt="FnM's - saves you money"
            width={120}
            height={120}
            unoptimized
            className="h-[120px] w-auto"
            priority
          />
        </Link>
        <div className="w-28 shrink-0" aria-hidden />
        <HeaderSearch />
        <div className="flex shrink-0 items-center gap-1">
          <AreaSelector />
          <WalletBal />
          <WishlistSummary />
          <CartSummary />
          <div className="ml-1 h-8 w-px shrink-0 bg-border" aria-hidden />
          {mounted ? (
            <HeaderAuthNav />
          ) : (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" aria-hidden />
          )}
        </div>
      </div>
    </header>
  );
}
