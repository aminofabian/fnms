"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RecentOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalCents: number;
  createdAt: string;
  customerName: string;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  CONFIRMED: "bg-blue-500/10 text-blue-600",
  PROCESSING: "bg-purple-500/10 text-purple-600",
  OUT_FOR_DELIVERY: "bg-indigo-500/10 text-indigo-600",
  DELIVERED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-orange-500/10 text-orange-600",
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Recent Orders</h2>
        <p className="text-center text-sm text-muted-foreground py-8">
          No orders yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Recent Orders</h2>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary"
            >
              <div>
                <p className="font-mono text-sm font-medium text-foreground">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.customerName} · {date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[order.status] || ""}`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-medium">
                  KES {(order.totalCents / 100).toLocaleString()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
