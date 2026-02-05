"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ServiceArea } from "@/types/service-area";

interface AreaFormProps {
  area?: ServiceArea;
}

export function AreaForm({ area }: AreaFormProps) {
  const router = useRouter();
  const isEditing = !!area;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    deliveryFeeCents: 0,
    minOrderCents: 0,
    estimatedTime: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        slug: area.slug,
        deliveryFeeCents: area.deliveryFeeCents,
        minOrderCents: area.minOrderCents,
        estimatedTime: area.estimatedTime || "",
        isActive: area.isActive,
      });
    }
  }, [area]);

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing
        ? prev.slug
        : name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/service-areas/${area.slug}`
        : "/api/service-areas";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/service-areas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Area Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="e.g., Mirema"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            required
            pattern="[a-z0-9-]+"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="e.g., mirema"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            URL-friendly identifier (lowercase, no spaces)
          </p>
        </div>

        {/* Delivery Fee */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Delivery Fee (KES) *
          </label>
          <input
            type="number"
            value={formData.deliveryFeeCents / 100}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                deliveryFeeCents: Math.round(parseFloat(e.target.value || "0") * 100),
              }))
            }
            required
            min="0"
            step="1"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Minimum Order */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Minimum Order (KES) *
          </label>
          <input
            type="number"
            value={formData.minOrderCents / 100}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minOrderCents: Math.round(parseFloat(e.target.value || "0") * 100),
              }))
            }
            required
            min="0"
            step="1"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Estimated Time */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Estimated Delivery Time
          </label>
          <input
            type="text"
            value={formData.estimatedTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, estimatedTime: e.target.value }))
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="e.g., 30-45 mins"
          />
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActive"
                checked={formData.isActive}
                onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActive"
                checked={!formData.isActive}
                onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm text-foreground">Inactive</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Area" : "Create Area"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-6 py-2 font-medium text-foreground hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
