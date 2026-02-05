import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { OrderStatusBadge } from "./order-status";
import type { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const itemCount = order.items?.length ?? 0;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {order.orderNumber}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            KES {(order.totalCents / 100).toLocaleString()}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      </div>
    </Link>
  );
}
