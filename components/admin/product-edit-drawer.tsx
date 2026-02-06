"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

interface ProductEditDrawerProps {
  open: boolean;
  onClose: () => void;
  productSlug: string | null;
}

export function ProductEditDrawer({ open, onClose, productSlug }: ProductEditDrawerProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !productSlug) {
      setProduct(null);
      setCategories([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/products/${productSlug}`),
      fetch("/api/categories"),
    ])
      .then(async ([productRes, categoriesRes]) => {
        if (cancelled) return;
        if (!productRes.ok) {
          const data = await productRes.json().catch(() => ({}));
          setError(data.error ?? "Failed to load product");
          return;
        }
        if (!categoriesRes.ok) {
          setError("Failed to load categories");
          return;
        }
        const [productData, categoriesData] = await Promise.all([
          productRes.json(),
          categoriesRes.json(),
        ]);
        setProduct(productData);
        setCategories(categoriesData);
      })
      .catch(() => {
        if (!cancelled) setError("Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, productSlug]);

  function handleSuccess() {
    router.refresh();
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h2 id="drawer-title" className="text-lg font-semibold text-foreground">
            Edit Product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {error && !loading && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {product && categories.length >= 0 && !loading && (
            <ProductForm
              product={product}
              categories={categories}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
