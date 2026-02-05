"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, MapPin, ClipboardList, RefreshCw } from "lucide-react";
import {
  StatsCards,
  RecentOrders,
  LowStockAlert,
  TopProducts,
  SalesChart,
  OrderStatusChart,
} from "@/components/admin/dashboard";

interface DashboardData {
  stats: {
    todayOrders: number;
    todaySales: number;
    pendingOrders: number;
    totalOrders: number;
    totalCustomers: number;
  };
  lowStockProducts: Array<{
    id: number;
    name: string;
    slug: string;
    stockQuantity: number;
  }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    totalCents: number;
    createdAt: string;
    customerName: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    slug: string;
    totalSold: number;
  }>;
  ordersByStatus: Record<string, number>;
  salesByDay: Array<{
    date: string;
    orders: number;
    sales: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchDashboard();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 animate-pulse rounded bg-card" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-card" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-card" />
          <div className="h-64 animate-pulse rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome to the FnM&apos;s Mini Mart admin panel
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {data && <StatsCards stats={data.stats} />}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/categories"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Categories</p>
            <p className="text-xs text-muted-foreground">Manage categories</p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Products</p>
            <p className="text-xs text-muted-foreground">Manage inventory</p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Orders</p>
            <p className="text-xs text-muted-foreground">Process orders</p>
          </div>
        </Link>

        <Link
          href="/admin/service-areas"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Service Areas</p>
            <p className="text-xs text-muted-foreground">Delivery zones</p>
          </div>
        </Link>
      </div>

      {/* Charts Row */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart data={data.salesByDay} />
          <OrderStatusChart data={data.ordersByStatus} />
        </div>
      )}

      {/* Bottom Row */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrders orders={data.recentOrders} />
          </div>
          <div className="space-y-6">
            <LowStockAlert products={data.lowStockProducts} />
            <TopProducts products={data.topProducts} />
          </div>
        </div>
      )}
    </div>
  );
}
