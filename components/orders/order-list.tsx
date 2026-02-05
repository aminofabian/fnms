"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { OrderCard } from "./order-card";
import type { Order } from "@/types/order";

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        // Map DB rows to Order type
        const mapped = Array.isArray(data)
          ? data.map((r: Record<string, unknown>) => ({
              id: Number(r.id),
              orderNumber: String(r.order_number),
              userId: r.user_id ? Number(r.user_id) : null,
              status: String(r.status) as Order["status"],
              subtotalCents: Number(r.subtotal_cents) || 0,
              deliveryFeeCents: Number(r.delivery_fee_cents) || 0,
              discountCents: Number(r.discount_cents) || 0,
              totalCents: Number(r.total_cents) || 0,
              serviceAreaId: Number(r.service_area_id),
              recipientName: String(r.recipient_name),
              recipientPhone: String(r.recipient_phone),
              deliveryAddress: String(r.delivery_address),
              deliveryNotes: r.delivery_notes ? String(r.delivery_notes) : null,
              paymentMethod: String(r.payment_method) as Order["paymentMethod"],
              paymentStatus: String(r.payment_status) as Order["paymentStatus"],
              createdAt: String(r.created_at),
              updatedAt: String(r.updated_at),
            }))
          : [];
        setOrders(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-card">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No orders yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your order history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
