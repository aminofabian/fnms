"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface TopProduct {
  id: number;
  name: string;
  slug: string;
  totalSold: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Top Selling (30 days)</h2>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sales data yet
        </p>
      </div>
    );
  }

  const maxSold = Math.max(...products.map((p) => p.totalSold));

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Top Selling (30 days)</h2>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => {
          const percentage = (product.totalSold / maxSold) * 100;

          return (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="block rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {product.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {product.totalSold} sold
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
