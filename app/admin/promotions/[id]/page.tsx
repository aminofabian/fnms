"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PromoForm } from "@/components/admin/promo";
import type { PromoCode } from "@/types/promo";

export default function EditPromoPage() {
  const params = useParams();
  const router = useRouter();
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/promo/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setPromo(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/promotions");
      });
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (!promo) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Promo Code</h1>
        <p className="text-muted-foreground">
          Update promo: <code className="rounded bg-muted px-2 py-1">{promo.code}</code>
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <PromoForm promo={promo} />
      </div>
    </div>
  );
}
