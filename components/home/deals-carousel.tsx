"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Flame, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/wishlist";
import type { Product } from "@/types/product";

interface DealsCarouselProps {
  deals: Product[];
}

interface DealCardProps {
  product: Product;
  imageUrl?: string;
  price: number;
  comparePrice: number;
  discount: number;
}

function DealCard({ product, imageUrl, price, comparePrice, discount }: DealCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stockQuantity > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, 1);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card shadow-md ring-1 ring-black/5 transition hover:shadow-lg hover:ring-primary/20 sm:w-40"
    >
      <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow">
        -{discount}%
      </span>
      <div
        className="absolute right-2 top-2 z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <WishlistButton productId={product.id} size="sm" />
      </div>
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <span className="text-3xl" aria-hidden>🛒</span>
          </div>
        )}
        {/* Hover overlay: Add to cart */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm">
          {product.name}
        </p>
        <p className="mt-2 text-sm font-bold text-primary">
          KES {price.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground line-through">
          KES {comparePrice.toLocaleString()}
        </p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </Link>
  );
}

export function DealsCarousel({ deals }: DealsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const displayDeals = deals.slice(0, 10);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(!atEnd);
  }

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const amount = Math.min(el.clientWidth * 0.9, 400);
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    if (direction === "right" && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  }

  // Auto-scroll: runs every 3s, pauses on hover
  useEffect(() => {
    if (isHovered || displayDeals.length <= 1) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const amount = Math.min(el.clientWidth * 0.9, 400);
        el.scrollBy({ left: amount, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(id);
  }, [isHovered, displayDeals.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [displayDeals.length]);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            Deals
          </span>
          <h2
            id="deals-heading"
            className="text-[8px] font-semibold uppercase tracking-wide sm:text-[9px]"
            style={{ color: "var(--nav-green)" } as React.CSSProperties}
          >
            Today&apos;s offers
          </h2>
        </div>
        {displayDeals.length > 1 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-accent disabled:opacity-40 disabled:hover:bg-card"
              aria-label="Previous deals"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-accent disabled:opacity-40 disabled:hover:bg-card"
              aria-label="Next deals"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 md:gap-5"
      >
        {displayDeals.map((product) => {
          const imageUrl = product.images?.[0]?.url;
          const price = product.priceCents / 100;
          const comparePrice = product.compareAtCents! / 100;
          const discount = Math.round((1 - price / comparePrice) * 100);
          return (
            <DealCard
              key={product.id}
              product={product}
              imageUrl={imageUrl}
              price={price}
              comparePrice={comparePrice}
              discount={discount}
            />
          );
        })}
      </div>
    </div>
  );
}
