"use client";

import Link from "next/link";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { ServiceArea } from "@/types/service-area";

interface AreaTableProps {
  areas: ServiceArea[];
  onDelete: (slug: string) => void;
  deleting: string | null;
}

export function AreaTable({ areas, onDelete, deleting }: AreaTableProps) {
  if (areas.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No service areas found</p>
        <Link
          href="/admin/service-areas/new"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add First Area
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
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Slug
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Delivery Fee
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
              Min Order
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
          {areas.map((area) => (
            <tr key={area.id} className="bg-card hover:bg-accent/50">
              <td className="px-4 py-3">
                <span className="font-medium text-foreground">{area.name}</span>
                {area.estimatedTime && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({area.estimatedTime})
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {area.slug}
                </code>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-medium text-foreground">
                  KES {(area.deliveryFeeCents / 100).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-muted-foreground">
                  KES {(area.minOrderCents / 100).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {area.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/service-areas/${area.slug}`}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(area.slug)}
                    disabled={deleting === area.slug}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
