import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { OrderItem } from "@/types/order";

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/50 overflow-hidden">
            {item.productImageUrl ? (
              <img
                src={item.productImageUrl}
                alt={item.productName ?? "Product"}
                className="h-full w-full object-cover"
              />
            ) : (
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {item.productSlug ? (
              <Link
                href={`/products/${item.productSlug}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {item.productName}
              </Link>
            ) : (
              <p className="font-medium text-foreground">{item.productName}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              KES {(item.unitPriceCents / 100).toLocaleString()} × {item.quantity}
            </p>
          </div>
          <p className="font-semibold text-foreground">
            KES {((item.unitPriceCents * item.quantity) / 100).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
