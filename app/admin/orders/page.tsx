"use client";

import { useEffect, useState, useCallback } from "react";
import { OrderFilters } from "@/components/admin/orders/order-filters";
import { OrderTable } from "@/components/admin/orders/order-table";
import type { Order, OrderStatus } from "@/types/order";

interface OrderRow {
  id: number;
  order_number: string;
  user_id: number | null;
  status: string;
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  service_area_id: number;
  area_name: string | null;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  delivery_notes: string | null;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  item_count: number;
}

function rowToOrder(row: OrderRow): Order & { item_count: number } {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    status: row.status as OrderStatus,
    subtotalCents: row.subtotal_cents || 0,
    deliveryFeeCents: row.delivery_fee_cents || 0,
    discountCents: row.discount_cents || 0,
    totalCents: row.total_cents || 0,
    serviceAreaId: row.service_area_id,
    serviceAreaName: row.area_name || undefined,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    deliveryAddress: row.delivery_address,
    deliveryNotes: row.delivery_notes,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    item_count: row.item_count,
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { item_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders((data.orders || []).map((r: OrderRow) => rowToOrder(r)));
      setTotalPages(data.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
      </div>

      <OrderFilters
        status={status}
        search={search}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : (
        <>
          <OrderTable orders={orders} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
