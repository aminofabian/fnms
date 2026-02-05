"use client";

import { BarChart3 } from "lucide-react";

interface SalesDay {
  date: string;
  orders: number;
  sales: number;
}

interface SalesChartProps {
  data: SalesDay[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Sales (Last 7 Days)</h2>
        </div>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sales data yet
        </p>
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Sales (Last 7 Days)</h2>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            KES {(totalSales / 100).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{totalOrders} orders</p>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="mt-6 flex items-end gap-2" style={{ height: "120px" }}>
        {data.map((day) => {
          const height = (day.sales / maxSales) * 100;
          const date = new Date(day.date as string);
          const dayName = date.toLocaleDateString("en-KE", { weekday: "short" });

          return (
            <div
              key={day.date as string}
              className="group relative flex flex-1 flex-col items-center"
            >
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg border border-border bg-card px-2 py-1 text-xs shadow-lg group-hover:block">
                <p className="font-medium">KES {(day.sales / 100).toLocaleString()}</p>
                <p className="text-muted-foreground">{day.orders} orders</p>
              </div>

              {/* Bar */}
              <div
                className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                style={{ height: `${Math.max(height, 4)}%` }}
              />

              {/* Label */}
              <span className="mt-2 text-xs text-muted-foreground">{dayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
