"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, CreditCard, User, Mail } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { OrderItems } from "@/components/orders/order-items";
import { StatusUpdate } from "@/components/admin/orders/status-update";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

interface OrderData {
  order: Record<string, unknown>;
  items: Record<string, unknown>[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: OrderData) => {
        const o = data.order;
        setOrder({
          id: Number(o.id),
          orderNumber: String(o.order_number),
          userId: o.user_id ? Number(o.user_id) : null,
          status: String(o.status) as OrderStatus,
          subtotalCents: Number(o.subtotal_cents) || 0,
          deliveryFeeCents: Number(o.delivery_fee_cents) || 0,
          discountCents: Number(o.discount_cents) || 0,
          totalCents: Number(o.total_cents) || 0,
          serviceAreaId: Number(o.service_area_id),
          serviceAreaName: o.area_name ? String(o.area_name) : undefined,
          recipientName: String(o.recipient_name),
          recipientPhone: String(o.recipient_phone),
          deliveryAddress: String(o.delivery_address),
          deliveryNotes: o.delivery_notes ? String(o.delivery_notes) : null,
          paymentMethod: String(o.payment_method) as Order["paymentMethod"],
          paymentStatus: String(o.payment_status) as Order["paymentStatus"],
          createdAt: String(o.created_at),
          updatedAt: String(o.updated_at),
        });
        setItems(
          data.items.map((i) => ({
            id: Number(i.id),
            orderId: Number(i.order_id),
            productId: Number(i.product_id),
            variantId: i.variant_id ? Number(i.variant_id) : null,
            quantity: Number(i.quantity),
            unitPriceCents: Number(i.unit_price_cents),
            productName: i.product_name ? String(i.product_name) : undefined,
            productSlug: i.product_slug ? String(i.product_slug) : undefined,
            productImageUrl: i.image_url ? String(i.image_url) : null,
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/orders");
      });
  }, [params.id, router]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card hover:bg-accent"
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

      {/* Status Update */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 font-semibold text-foreground">Update Status</h2>
        <StatusUpdate
          orderId={order.id}
          currentStatus={order.status}
          onUpdate={(newStatus) => setOrder({ ...order, status: newStatus })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Items */}
        <div>
          <h2 className="mb-4 font-semibold text-foreground">Items</h2>
          <OrderItems items={items} />
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 font-semibold text-foreground">Customer</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{order.recipientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${order.recipientPhone}`} className="text-primary hover:underline">
                  {order.recipientPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 font-semibold text-foreground">Delivery</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-foreground">{order.deliveryAddress}</p>
                  {order.serviceAreaName && (
                    <p className="text-muted-foreground">{order.serviceAreaName}</p>
                  )}
                </div>
              </div>
              {order.deliveryNotes && (
                <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground italic">
                  {order.deliveryNotes}
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 font-semibold text-foreground">Payment</h2>
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "M-Pesa"}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                order.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-800"
                  : order.paymentStatus === "FAILED"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-4 font-semibold text-foreground">Summary</h2>
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
        </div>
      </div>
    </div>
  );
}
