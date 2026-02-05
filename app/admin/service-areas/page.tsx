"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Inbox } from "lucide-react";
import { AreaTable, AreaRequestsTable } from "@/components/admin/service-areas";
import type { ServiceArea } from "@/types/service-area";

interface AreaRequest {
  id: number;
  areaName: string;
  contactEmail: string;
  status: string;
  createdAt: string;
}

export default function AdminServiceAreasPage() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [requests, setRequests] = useState<AreaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingRequest, setUpdatingRequest] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"areas" | "requests">("areas");

  useEffect(() => {
    Promise.all([
      fetch("/api/service-areas?includeInactive=true").then((r) => r.json()),
      fetch("/api/service-areas/request").then((r) => r.json()),
    ])
      .then(([areasData, requestsData]) => {
        setAreas(Array.isArray(areasData) ? areasData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm("Are you sure you want to delete this service area?")) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/service-areas/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setAreas((prev) => prev.filter((a) => a.slug !== slug));
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleUpdateRequestStatus(id: number, status: string) {
    setUpdatingRequest(id);
    try {
      const res = await fetch(`/api/admin/area-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } finally {
      setUpdatingRequest(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-card" />
          <div className="h-10 w-32 animate-pulse rounded bg-card" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Areas</h1>
          <p className="text-muted-foreground">
            Manage delivery zones and area requests
          </p>
        </div>
        <Link
          href="/admin/service-areas/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Area
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("areas")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "areas"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Areas ({areas.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Inbox className="h-4 w-4" />
          Requests
          {pendingRequests > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {pendingRequests}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "areas" ? (
        <AreaTable areas={areas} onDelete={handleDelete} deleting={deleting} />
      ) : (
        <AreaRequestsTable
          requests={requests}
          onUpdateStatus={handleUpdateRequestStatus}
          updating={updatingRequest}
        />
      )}
    </div>
  );
}
