"use client";

import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order } from "@/types/order";

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Order
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Customer
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Area
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Items
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Total
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <tr key={order.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono font-medium text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{order.recipientName}</p>
                  <p className="text-xs text-muted-foreground">{order.recipientPhone}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.serviceAreaName || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(order as Order & { item_count?: number }).item_count ?? order.items?.length ?? "—"}
                </td>
                <td className="px-4 py-3 font-medium">
                  KES {(order.totalCents / 100).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
