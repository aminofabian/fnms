"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images?.map((i) => i.url) ?? []);
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      categoryId: product?.categoryId ?? 0,
      slug: product?.slug ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      priceCents: product?.priceCents ?? 0,
      compareAtCents: product?.compareAtCents ?? undefined,
      unit: product?.unit ?? "",
      stockQuantity: product?.stockQuantity ?? 0,
      isActive: product?.isActive ?? true,
    },
  });


  const name = watch("name");

  function generateSlug() {
    const slug = (name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  }

  async function onSubmit(data: ProductFormData) {
    setError(null);
    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    try {
      const url = isEditing ? `/api/products/${product.slug}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong");
        return;
      }

      const slug = json.slug ?? parsed.data.slug;
      const existingUrls = new Set(product?.images?.map((i) => i.url) ?? []);
      let sortOrder = product?.images?.length ?? 0;
      for (const imgUrl of imageUrls) {
        if (!imgUrl || existingUrls.has(imgUrl)) continue;
        await fetch(`/api/products/${slug}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imgUrl, sortOrder }),
        });
        sortOrder++;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"?`)) return;
    const res = await fetch(`/api/products/${product.slug}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
          <input
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Slug *</label>
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("slug")}
            />
            <button type="button" onClick={generateSlug} className="shrink-0 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
              Generate
            </button>
          </div>
          {errors.slug && <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Category *</label>
        <select
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          {...register("categoryId", { valueAsNumber: true })}
        >
          <option value={0}>Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Price (KES) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={watch("priceCents") / 100 || ""}
            onChange={(e) => setValue("priceCents", Math.round(parseFloat(e.target.value || "0") * 100))}
          />
          <p className="mt-1 text-xs text-muted-foreground">e.g. 100 = KES 100</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Compare at (KES)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={watch("compareAtCents") != null ? watch("compareAtCents")! / 100 : ""}
            onChange={(e) => {
              const v = e.target.value;
              setValue("compareAtCents", v === "" ? undefined : Math.round(parseFloat(v) * 100));
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Unit</label>
          <input
            placeholder="e.g. kg, piece"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("unit")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Stock</label>
          <input
            type="number"
            min="0"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("stockQuantity", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Images</label>
        <div className="flex flex-wrap gap-4">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative">
              <ImageUpload
                value={url}
                onChange={(newUrl) => {
                  const next = [...imageUrls];
                  next[i] = newUrl;
                  setImageUrls(next.filter(Boolean));
                }}
                folder="fnms/products"
              />
            </div>
          ))}
          <ImageUpload
            value=""
            onChange={(url) => setImageUrls((prev) => [...prev, url])}
            folder="fnms/products"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isActive")} className="rounded border-border" />
          <span className="text-sm text-foreground">Active</span>
        </label>
      </div>

      <div className="flex justify-between border-t border-border pt-6">
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Delete
          </button>
        )}
        <div className="ml-auto flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}
