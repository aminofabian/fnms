"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, CreditCard } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderItems } from "@/components/orders/order-items";
import { ReorderButton } from "@/components/orders/reorder-button";
import type { Order } from "@/types/order";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/account/orders");
      });
  }, [params.id, router]);

  async function handleCancel() {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      if (res.ok) {
        setOrder({ ...order, status: "CANCELLED" });
      }
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (!order) return null;

  const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/account/orders"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card hover:bg-accent lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold text-foreground">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 font-semibold text-foreground">Order Status</h2>
        <OrderTimeline status={order.status} />
      </div>

      {/* Items */}
      <div>
        <h2 className="mb-4 font-semibold text-foreground">Items</h2>
        {order.items && <OrderItems items={order.items} />}
      </div>

      {/* Delivery Info */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 font-semibold text-foreground">Delivery Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{order.recipientName}</p>
              <p className="text-muted-foreground">{order.deliveryAddress}</p>
              {order.serviceAreaName && (
                <p className="text-muted-foreground">{order.serviceAreaName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{order.recipientPhone}</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Paystack"}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 font-semibold text-foreground">Order Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">KES {(order.subtotalCents / 100).toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="font-medium">KES {(order.deliveryFeeCents / 100).toLocaleString()}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-green-600">
              <dt>Discount</dt>
              <dd className="font-medium">-KES {(order.discountCents / 100).toLocaleString()}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-bold">KES {(order.totalCents / 100).toLocaleString()}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {order.items && order.status === "DELIVERED" && (
          <ReorderButton items={order.items} />
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded-lg border border-destructive px-4 py-2 font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
}
