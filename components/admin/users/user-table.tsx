"use client";

import { useState } from "react";
import {
  Wallet,
  Ban,
  CheckCircle,
  MoreHorizontal,
  UserCog,
} from "lucide-react";
import type { AdminUser } from "@/types/admin-user";

interface UserTableProps {
  users: AdminUser[];
  onAdjustWallet: (user: AdminUser) => void;
  onBlockOrRoleChange: () => void;
}

function formatKes(cents: number): string {
  return `KES ${(cents / 100).toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserTable({
  users,
  onAdjustWallet,
  onBlockOrRoleChange,
}: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleBlock = async (user: AdminUser) => {
    setOpenMenuId(null);
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !user.blocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onBlockOrRoleChange();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const setRole = async (user: AdminUser, role: "customer" | "admin") => {
    setOpenMenuId(null);
    if (user.role === role) return;
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onBlockOrRoleChange();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              User
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Contact
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Wallet
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Orders
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Joined
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => {
            const isMenuOpen = openMenuId === user.id;
            const isUpdating = updatingId === user.id;
            return (
              <tr key={user.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {user.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.phone || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium tabular-nums">
                  {formatKes(user.walletBalanceCents)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.orderCount}
                </td>
                <td className="px-4 py-3">
                  {user.blocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      <Ban className="h-3 w-3" /> Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : user.id)}
                      disabled={isUpdating}
                      className="rounded-lg p-2 hover:bg-muted disabled:opacity-50"
                      aria-label="Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          aria-hidden
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-card py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              onAdjustWallet(user);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                          >
                            <Wallet className="h-4 w-4" />
                            Adjust wallet
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBlock(user)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                          >
                            {user.blocked ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Unblock user
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" />
                                Block user
                              </>
                            )}
                          </button>
                          {user.role === "customer" ? (
                            <button
                              type="button"
                              onClick={() => setRole(user, "admin")}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                            >
                              <UserCog className="h-4 w-4" />
                              Make admin
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRole(user, "customer")}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                            >
                              <UserCog className="h-4 w-4" />
                              Remove admin
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
