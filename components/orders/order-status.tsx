import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status] || status;
  const colorClass = ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
