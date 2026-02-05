"use client";

import { MapPin, Mail, Clock } from "lucide-react";

interface AreaRequest {
  id: number;
  areaName: string;
  contactEmail: string;
  status: string;
  createdAt: string;
}

interface AreaRequestsTableProps {
  requests: AreaRequest[];
  onUpdateStatus: (id: number, status: string) => void;
  updating: number | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  reviewed: "bg-blue-500/10 text-blue-600",
  approved: "bg-green-500/10 text-green-600",
  rejected: "bg-orange-500/10 text-orange-600",
};

export function AreaRequestsTable({
  requests,
  onUpdateStatus,
  updating,
}: AreaRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 font-medium text-foreground">No area requests</p>
        <p className="text-sm text-muted-foreground">
          Customers haven&apos;t requested any new delivery areas yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const date = new Date(request.createdAt).toLocaleDateString("en-KE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={request.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {request.areaName}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[request.status] || statusColors.pending
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {request.contactEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={request.status}
                  onChange={(e) => onUpdateStatus(request.id, e.target.value)}
                  disabled={updating === request.id}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
