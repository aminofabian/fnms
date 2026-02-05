"use client";

import { DollarSign, ShoppingCart, Clock, Users } from "lucide-react";

interface StatsCardsProps {
  stats: {
    todayOrders: number;
    todaySales: number;
    pendingOrders: number;
    totalOrders: number;
    totalCustomers: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Today's Sales",
      value: `KES ${(stats.todaySales / 100).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {card.value}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
