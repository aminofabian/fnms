"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Minus, Plus, Check, X } from "lucide-react";

interface InventoryProduct {
  id: number;
  name: string;
  slug: string;
  stockQuantity: number;
  isActive: boolean;
  categoryName: string | null;
}

interface InventoryTableProps {
  products: InventoryProduct[];
  onUpdateStock: (productId: number, newStock: number) => Promise<void>;
}

export function InventoryTable({ products, onUpdateStock }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  function startEditing(product: InventoryProduct) {
    setEditingId(product.id);
    setEditValue(product.stockQuantity);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValue(0);
  }

  async function saveStock(productId: number) {
    setSaving(true);
    try {
      await onUpdateStock(productId, editValue);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function quickAdjust(productId: number, currentStock: number, delta: number) {
    const newStock = Math.max(0, currentStock + delta);
    await onUpdateStock(productId, newStock);
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 font-medium text-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or add products first
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-card">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Product
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Category
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Stock
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Quick Adjust
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            const stockStatus =
              product.stockQuantity === 0
                ? "out"
                : product.stockQuantity <= 10
                  ? "low"
                  : "ok";

            return (
              <tr key={product.id} className="bg-card hover:bg-accent/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {product.categoryName || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <div className="inline-flex items-center gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20 rounded border border-border bg-background px-2 py-1 text-center text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => saveStock(product.id)}
                        disabled={saving}
                        className="rounded p-1 text-green-600 hover:bg-green-500/10"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="rounded p-1 text-orange-600 hover:bg-orange-500/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(product)}
                      className={`rounded px-3 py-1 text-sm font-bold ${
                        stockStatus === "out"
                          ? "bg-orange-500/10 text-orange-600"
                          : stockStatus === "low"
                            ? "bg-orange-500/10 text-orange-600"
                            : "bg-green-500/10 text-green-600"
                      } hover:opacity-80`}
                    >
                      {product.stockQuantity}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      stockStatus === "out"
                        ? "bg-orange-500/10 text-orange-600"
                        : stockStatus === "low"
                          ? "bg-orange-500/10 text-orange-600"
                          : "bg-green-500/10 text-green-600"
                    }`}
                  >
                    {stockStatus === "out"
                      ? "Out of Stock"
                      : stockStatus === "low"
                        ? "Low Stock"
                        : "In Stock"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => quickAdjust(product.id, product.stockQuantity, -1)}
                      disabled={product.stockQuantity === 0}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => quickAdjust(product.id, product.stockQuantity, 1)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => quickAdjust(product.id, product.stockQuantity, 10)}
                      className="ml-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      +10
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
