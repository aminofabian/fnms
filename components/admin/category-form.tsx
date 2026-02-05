"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { categorySchema, type CategoryFormData } from "@/lib/validations/category";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Category } from "@/types/category";

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      slug: category?.slug ?? "",
      name: category?.name ?? "",
      description: category?.description ?? "",
      imageUrl: category?.imageUrl ?? "",
      sortOrder: category?.sortOrder ?? 0,
    },
  });

  const name = watch("name");
  const imageUrl = watch("imageUrl");

  function generateSlug() {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slug);
  }

  async function onSubmit(data: CategoryFormData) {
    setError(null);

    // Validate with zod before submitting
    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      setError(firstError?.message ?? "Validation failed");
      return;
    }

    try {
      const url = isEditing ? `/api/categories/${category.slug}` : "/api/categories";
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

      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  async function handleDelete() {
    if (!category) return;
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/categories/${category.slug}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      }
    } catch {
      setError("Failed to delete category");
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
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
            Name *
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-foreground">
            Slug *
          </label>
          <div className="flex gap-2">
            <input
              id="slug"
              type="text"
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("slug")}
            />
            <button
              type="button"
              onClick={generateSlug}
              className="shrink-0 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
            >
              Generate
            </button>
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          {...register("description")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Image
          </label>
          <ImageUpload
            value={imageUrl}
            onChange={(url) => setValue("imageUrl", url)}
            folder="fnms/categories"
          />
        </div>

        <div>
          <label htmlFor="sortOrder" className="mb-1 block text-sm font-medium text-foreground">
            Sort Order
          </label>
          <input
            id="sortOrder"
            type="number"
            min="0"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("sortOrder", { valueAsNumber: true })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers appear first
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
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
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}
