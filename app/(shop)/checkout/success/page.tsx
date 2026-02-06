"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Clock, ExternalLink, Smartphone } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

const TILL_NUMBER = "3020127";

interface OrderSummary {
  orderNumber: string;
  totalCents: number;
  paymentMethod?: string | null;
  createdAt: string;
  estimatedDelivery: string;
  items: { name: string; quantity: number; unitPriceCents: number }[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderParam =
    searchParams.get("order") ??
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    "";

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(orderParam));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderParam) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError(null);
    fetch(`/api/orders/by-number?orderNumber=${encodeURIComponent(orderParam)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error("Failed to load order details");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderParam]);

  const trackOrderUrl = "/account/orders";
  const shareableLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkout/success?order=${encodeURIComponent(orderParam)}`
      : "";

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-foreground">Order Placed!</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you for your order. We&apos;ll be in touch soon.
      </p>

      {orderParam && !order && !error && (
        <p className="mt-4 rounded-md bg-muted px-4 py-3 font-mono text-lg font-semibold text-foreground">
          {orderParam}
        </p>
      )}

      {loading && (
        <p className="mt-6 text-sm text-muted-foreground">Loading order details…</p>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {order && (
        <div className="mt-8 text-left">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 font-mono text-sm font-semibold text-foreground">
              Order #{order.orderNumber}
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4 shrink-0" />
              <span className="font-medium text-foreground">What you ordered</span>
            </div>
            <ul className="mt-2 space-y-2 border-b border-border pb-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    KES{" "}
                    {(
                      (item.unitPriceCents * item.quantity) /
                      100
                    ).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 pt-3 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="font-medium text-foreground">Estimated delivery</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.estimatedDelivery}
            </p>

            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold">
                KES {(order.totalCents / 100).toLocaleString()}
              </span>
            </div>
          </div>

          {order.paymentMethod?.toUpperCase() === "TILL" && (
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Smartphone className="h-5 w-5 text-primary" />
                <span>Pay via till</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Send <strong className="text-foreground">KES {(order.totalCents / 100).toLocaleString()}</strong> to till{" "}
                <strong className="font-mono text-foreground">{TILL_NUMBER}</strong>.
                This will be processed manually — we&apos;ll confirm once payment is received.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">
              Follow your order
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Use the link below to check status and updates.
            </p>
            <Link
              href={trackOrderUrl}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" />
              Track your order
            </Link>
            {shareableLink && (
              <p className="mt-3 text-xs text-muted-foreground">
                Save this link to return later:{" "}
                <a
                  href={shareableLink}
                  className="break-all text-primary underline hover:no-underline"
                >
                  {shareableLink}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/products"
          className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
        >
          Continue Shopping
        </Link>
        <Link
          href={trackOrderUrl}
          className="rounded-md border border-border px-6 py-3 font-medium text-foreground hover:bg-accent"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-lg px-4 py-16 text-center">
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
