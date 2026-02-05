"use client";

import Link from "next/link";
import { Edit, Trash2, CheckCircle, XCircle, Percent, DollarSign } from "lucide-react";
import type { PromoCode } from "@/types/promo";

interface PromoTableProps {
  promos: PromoCode[];
  onDelete: (id: number) => void;
  deleting: number | null;
}

export function PromoTable({ promos, onDelete, deleting }: PromoTableProps) {
  if (promos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No promo codes found</p>
        <Link
          href="/admin/promotions/new"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create First Promo
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-card">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Code
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Discount
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Min Order
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Usage
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {promos.map((promo) => {
            const now = new Date();
            const isExpired = promo.expiresAt && new Date(promo.expiresAt) < now;
            const isNotStarted = promo.startsAt && new Date(promo.startsAt) > now;
            const isUsedUp = promo.maxUsageCount !== null && promo.usageCount >= promo.maxUsageCount;

            let statusText = "Active";
            let statusClass = "bg-green-500/10 text-green-600";

            if (!promo.isActive) {
              statusText = "Inactive";
              statusClass = "bg-gray-500/10 text-gray-600";
            } else if (isExpired) {
              statusText = "Expired";
              statusClass = "bg-orange-500/10 text-orange-600";
            } else if (isNotStarted) {
              statusText = "Scheduled";
              statusClass = "bg-blue-500/10 text-blue-600";
            } else if (isUsedUp) {
              statusText = "Used Up";
              statusClass = "bg-orange-500/10 text-orange-600";
            }

            return (
              <tr key={promo.id} className="bg-card hover:bg-accent/50">
                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-bold">
                    {promo.code}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {promo.discountType === "PERCENTAGE" ? (
                      <>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {promo.discountValue}% off
                        </span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          KES {(promo.discountValue / 100).toLocaleString()} off
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {promo.minOrderCents > 0 ? (
                    <span className="text-muted-foreground">
                      KES {(promo.minOrderCents / 100).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-muted-foreground">
                    {promo.usageCount}
                    {promo.maxUsageCount !== null && ` / ${promo.maxUsageCount}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                    {promo.isActive ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {statusText}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/promotions/${promo.id}`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(promo.id)}
                      disabled={deleting === promo.id}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
