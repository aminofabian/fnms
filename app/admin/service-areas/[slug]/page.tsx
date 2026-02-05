"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AreaForm } from "@/components/admin/service-areas";
import type { ServiceArea } from "@/types/service-area";

export default function EditServiceAreaPage() {
  const params = useParams();
  const router = useRouter();
  const [area, setArea] = useState<ServiceArea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/service-areas/${params.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setArea(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/service-areas");
      });
  }, [params.slug, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (!area) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Service Area</h1>
        <p className="text-muted-foreground">
          Update delivery zone: {area.name}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <AreaForm area={area} />
      </div>
    </div>
  );
}
