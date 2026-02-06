"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Wallet, Ban, CheckCircle, MoreHorizontal, UserCog } from "lucide-react";
import { UserTable } from "@/components/admin/users/user-table";
import { WalletAdjustModal } from "@/components/admin/users/wallet-adjust-modal";
import type { AdminUser } from "@/types/admin-user";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [walletModalUser, setWalletModalUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setUsers((data.users || []).map((u: Record<string, unknown>) => toAdminUser(u)));
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const handleWalletUpdated = () => {
    setWalletModalUser(null);
    fetchUsers();
  };

  const handleBlockOrRoleUpdated = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { value: "", label: "All" },
            { value: "customer", label: "Customers" },
            { value: "admin", label: "Admins" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                roleFilter === r.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, phone..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            onAdjustWallet={setWalletModalUser}
            onBlockOrRoleChange={handleBlockOrRoleUpdated}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {walletModalUser && (
        <WalletAdjustModal
          user={walletModalUser}
          onClose={() => setWalletModalUser(null)}
          onSuccess={handleWalletUpdated}
        />
      )}
    </div>
  );
}

function toAdminUser(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    email: String(row.email ?? ""),
    name: row.name ? String(row.name) : null,
    phone: row.phone ? String(row.phone) : null,
    role: String(row.role ?? "customer"),
    walletBalanceCents: Number(row.wallet_balance_cents ?? 0),
    blocked: Number(row.blocked ?? 0) === 1,
    orderCount: Number(row.order_count ?? 0),
    createdAt: String(row.created_at ?? ""),
  };
}
