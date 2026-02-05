"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PromoCode } from "@/types/promo";

interface PromoFormProps {
  promo?: PromoCode;
}

export function PromoForm({ promo }: PromoFormProps) {
  const router = useRouter();
  const isEditing = !!promo;

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 0,
    minOrderCents: 0,
    maxUsageCount: null as number | null,
    startsAt: null as string | null,
    expiresAt: null as string | null,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (promo) {
      setFormData({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountType === "PERCENTAGE" 
          ? promo.discountValue 
          : promo.discountValue / 100,
        minOrderCents: promo.minOrderCents,
        maxUsageCount: promo.maxUsageCount,
        startsAt: promo.startsAt ? promo.startsAt.split("T")[0] : null,
        expiresAt: promo.expiresAt ? promo.expiresAt.split("T")[0] : null,
        isActive: promo.isActive,
      });
    }
  }, [promo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        ...formData,
        discountValue: formData.discountType === "PERCENTAGE"
          ? formData.discountValue
          : Math.round(formData.discountValue * 100), // Convert to cents
      };

      const url = isEditing ? `/api/admin/promo/${promo.id}` : "/api/admin/promo";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/promotions");
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
        {/* Code */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Promo Code *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
            }
            required
            maxLength={20}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 font-mono text-foreground uppercase placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="e.g., SAVE20"
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Discount Type *
          </label>
          <select
            value={formData.discountType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                discountType: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT",
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount (KES)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {formData.discountType === "PERCENTAGE" ? "Discount (%)" : "Discount Amount (KES)"} *
          </label>
          <input
            type="number"
            value={formData.discountValue}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                discountValue: parseFloat(e.target.value) || 0,
              }))
            }
            required
            min="0"
            max={formData.discountType === "PERCENTAGE" ? 100 : undefined}
            step={formData.discountType === "PERCENTAGE" ? "1" : "1"}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Minimum Order */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Minimum Order (KES)
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
            min="0"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Max Usage */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Max Usage Count
          </label>
          <input
            type="number"
            value={formData.maxUsageCount || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxUsageCount: e.target.value ? parseInt(e.target.value) : null,
              }))
            }
            min="1"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Unlimited"
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
                checked={formData.isActive}
                onChange={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!formData.isActive}
                onChange={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm text-foreground">Inactive</span>
            </label>
          </div>
        </div>

        {/* Starts At */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startsAt || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                startsAt: e.target.value || null,
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Expires At */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Expiry Date
          </label>
          <input
            type="date"
            value={formData.expiresAt || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expiresAt: e.target.value || null,
              }))
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Promo" : "Create Promo"}
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
