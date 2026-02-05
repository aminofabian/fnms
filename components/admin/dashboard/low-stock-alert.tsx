"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface LowStockProduct {
  id: number;
  name: string;
  slug: string;
  stockQuantity: number;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Low Stock Alert</h2>
        <div className="py-8 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <AlertTriangle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground">All products are well stocked</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <h2 className="font-semibold text-foreground">Low Stock Alert</h2>
      </div>

      <div className="space-y-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary"
          >
            <span className="text-sm font-medium text-foreground">
              {product.name}
            </span>
            <span
              className={`text-sm font-bold ${
                product.stockQuantity === 0
                  ? "text-orange-600"
                  : "text-orange-600"
              }`}
            >
              {product.stockQuantity === 0
                ? "Out of stock"
                : `${product.stockQuantity} left`}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/admin/products?filter=low-stock"
        className="mt-4 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
      >
        View all low stock
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
