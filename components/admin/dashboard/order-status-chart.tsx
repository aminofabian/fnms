"use client";

import { PieChart } from "lucide-react";

interface OrderStatusChartProps {
  data: Record<string, number>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500" },
  PROCESSING: { label: "Processing", color: "bg-purple-500" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-indigo-500" },
  DELIVERED: { label: "Delivered", color: "bg-green-500" },
  CANCELLED: { label: "Cancelled", color: "bg-orange-500" },
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Orders by Status</h2>
        </div>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No orders yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Orders by Status</h2>
      </div>

      <div className="space-y-3">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = data[status] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          if (count === 0) return null;

          return (
            <div key={status}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{config.label}</span>
                <span className="font-medium text-foreground">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${config.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">Total Orders</span>
          <span className="font-bold text-foreground">{total}</span>
        </div>
      </div>
    </div>
  );
}
