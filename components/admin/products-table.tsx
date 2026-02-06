"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { ProductEditDrawer } from "@/components/admin/product-edit-drawer";
import type { Product } from "@/types/product";

interface ProductRow extends Product {
  categoryName?: string;
}

interface ProductsTableProps {
  products: ProductRow[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  function openEdit(slug: string) {
    setSelectedSlug(slug);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedSlug(null);
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.slug}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.categoryName ?? "—"}</td>
                <td className="px-4 py-3 text-sm">KES {(p.priceCents / 100).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{p.stockQuantity}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(p.slug)}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductEditDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        productSlug={selectedSlug}
      />
    </>
  );
}
