"use client";

import { Search } from "lucide-react";
import type { OrderStatus } from "@/types/order";

interface OrderFiltersProps {
  status: OrderStatus | "";
  search: string;
  onStatusChange: (status: OrderStatus | "") => void;
  onSearchChange: (search: string) => void;
}

const statuses: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function OrderFilters({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              status === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-accent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search orders..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-64"
        />
      </div>
    </div>
  );
}
