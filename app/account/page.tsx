"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Package, MapPin, Settings, ChevronRight, LogOut, User } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order } from "@/types/order";

interface OrderRow {
  id: number;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
}

export default function AccountDashboardPage() {
  const { data: session } = useSession();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        const orders = Array.isArray(data)
          ? data.slice(0, 3).map((r: OrderRow) => ({
              id: r.id,
              orderNumber: r.order_number,
              status: r.status as Order["status"],
              totalCents: Number(r.total_cents) || 0,
              createdAt: r.created_at,
            }))
          : [];
        setRecentOrders(orders as Order[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const user = session?.user;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick actions - mobile */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        <Link
          href="/account/orders"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary"
        >
          <Package className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">Orders</span>
        </Link>
        <Link
          href="/account/addresses"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary"
        >
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">Addresses</span>
        </Link>
        <Link
          href="/account/settings"
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary"
        >
          <Settings className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-destructive"
        >
          <LogOut className="h-6 w-6 text-destructive" />
          <span className="text-sm font-medium text-destructive">Logout</span>
        </button>
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 font-medium text-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Start shopping to see your orders here
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const date = new Date(order.createdAt).toLocaleDateString("en-KE", {
                month: "short",
                day: "numeric",
              });
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-foreground">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <OrderStatusBadge status={order.status} />
                      <p className="mt-1 text-sm font-medium">
                        KES {(order.totalCents / 100).toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Logout - desktop */}
      <div className="hidden lg:block">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
