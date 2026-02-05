"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@/types/product";

interface ProductGridProps {
  initialProducts?: Product[];
  categorySlug?: string;
}

export function ProductGrid({ initialProducts, categorySlug }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts) return;

    const url = categorySlug
      ? `/api/products?category=${encodeURIComponent(categorySlug)}`
      : "/api/products";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [initialProducts, categorySlug]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
