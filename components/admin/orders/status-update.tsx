"use client";

import { useState } from "react";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types/order";

interface StatusUpdateProps {
  orderId: number;
  currentStatus: OrderStatus;
  onUpdate: (newStatus: OrderStatus) => void;
}

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export function StatusUpdate({ orderId, currentStatus, onUpdate }: StatusUpdateProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (status === currentStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        onUpdate(status);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={loading || status === currentStatus}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </div>
  );
}
