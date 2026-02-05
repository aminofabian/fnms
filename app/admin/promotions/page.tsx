"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { PromoTable } from "@/components/admin/promo";
import type { PromoCode } from "@/types/promo";

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/promo")
      .then((r) => r.json())
      .then((data) => {
        setPromos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-card" />
          <div className="h-10 w-32 animate-pulse rounded bg-card" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
          <p className="text-muted-foreground">
            Manage promo codes and discounts
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Promo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{promos.length}</p>
              <p className="text-sm text-muted-foreground">Total Promos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Ticket className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {promos.filter((p) => p.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Ticket className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {promos.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Uses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <PromoTable promos={promos} onDelete={handleDelete} deleting={deleting} />
    </div>
  );
}
