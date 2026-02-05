import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Truck, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import type { ServiceArea } from "@/types/service-area";

async function getServiceArea(slug: string): Promise<ServiceArea | null> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM service_areas WHERE slug = ? LIMIT 1",
    args: [slug],
  });

  if (rows.length === 0) return null;

  const row = rows[0] as Record<string, unknown>;
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    deliveryFeeCents: Number(row.delivery_fee_cents),
    minOrderCents: Number(row.min_order_cents),
    estimatedTime: row.estimated_time ? String(row.estimated_time) : null,
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = await getServiceArea(slug);
  if (!area) return { title: "Area Not Found" };
  return {
    title: `${area.name} Delivery | FnM's Mini Mart`,
    description: `We deliver to ${area.name}. ${area.estimatedTime || "Fast delivery"} available.`,
  };
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getServiceArea(slug);

  if (!area) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-foreground">
            FnM&apos;s Mini Mart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/delivery-areas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All delivery areas
        </Link>

        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{area.name}</h1>
              {!area.isActive && (
                <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Delivery paused
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span className="text-sm">Delivery fee</span>
              </div>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {area.deliveryFeeCents > 0
                  ? `KES ${(area.deliveryFeeCents / 100).toFixed(0)}`
                  : "Free"}
              </p>
            </div>

            {area.estimatedTime && (
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Estimated time</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-foreground">{area.estimatedTime}</p>
              </div>
            )}

            {area.minOrderCents > 0 && (
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">Minimum order</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  KES {(area.minOrderCents / 100).toFixed(0)}
                </p>
              </div>
            )}
          </div>

          {area.isActive && (
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
