"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { InventoryTable, InventoryStats } from "@/components/admin/inventory";

interface InventoryProduct {
  id: number;
  name: string;
  slug: string;
  stockQuantity: number;
  isActive: boolean;
  categoryName: string | null;
}

interface Stats {
  total: number;
  outOfStock: number;
  lowStock: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, outOfStock: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch inventory
  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter) params.set("filter", filter);
        if (searchDebounce) params.set("search", searchDebounce);

        const res = await fetch(`/api/admin/inventory?${params}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, [filter, searchDebounce]);

  async function handleUpdateStock(productId: number, newStock: number) {
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock }),
      });

      if (res.ok) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, stockQuantity: newStock } : p
          )
        );

        // Refresh stats
        const statsRes = await fetch("/api/admin/inventory");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  }

  function handleRefresh() {
    setFilter(null);
    setSearch("");
    setSearchDebounce("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage product stock levels
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <InventoryStats
        stats={stats}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : (
        <InventoryTable
          products={products}
          onUpdateStock={handleUpdateStock}
        />
      )}
    </div>
  );
}
