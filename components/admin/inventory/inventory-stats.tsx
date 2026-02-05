"use client";

import { Package, AlertTriangle, XCircle } from "lucide-react";

interface InventoryStatsProps {
  stats: {
    total: number;
    outOfStock: number;
    lowStock: number;
  };
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function InventoryStats({
  stats,
  activeFilter,
  onFilterChange,
}: InventoryStatsProps) {
  const cards = [
    {
      label: "Total Products",
      value: stats.total,
      filter: null,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      filter: "low-stock",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      filter: "out-of-stock",
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const isActive = activeFilter === card.filter;

        return (
          <button
            key={card.label}
            onClick={() => onFilterChange(isActive ? null : card.filter)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              isActive
                ? `${card.borderColor} ${card.bgColor}`
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
