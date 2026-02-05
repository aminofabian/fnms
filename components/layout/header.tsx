"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { AreaSelector } from "@/components/service-areas/area-selector";
import { CartIcon } from "@/components/cart/cart-icon";

function HeaderAuthNav() {
  const { data: session } = useSession();

  return session ? (
    <Link
      href="/account"
      className="flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent"
    >
      <User className="h-5 w-5" />
      <span className="hidden sm:inline">{session.user?.name || "Account"}</span>
    </Link>
  ) : (
    <Link
      href="/login"
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      Sign in
    </Link>
  );
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-foreground">
            FnM&apos;s
          </Link>
          <AreaSelector />
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/categories"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            Categories
          </Link>
          <Link
            href="/products"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            Products
          </Link>
          <Link
            href="/delivery-areas"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            Delivery Areas
          </Link>

          <CartIcon />

          {mounted ? (
            <HeaderAuthNav />
          ) : (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" aria-hidden />
          )}
        </nav>
      </div>
    </header>
  );
}
