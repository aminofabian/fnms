"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { AddressCard, AddressForm } from "@/components/account";
import type { ServiceArea } from "@/types/service-area";

interface Address {
  id: number;
  label: string;
  recipientName: string;
  recipientPhone: string;
  serviceAreaId: number;
  serviceAreaName: string | null;
  addressLine: string;
  notes: string | null;
  isDefault: boolean;
}

/** Payload for create/update: no id, no serviceAreaName (server-derived) */
type AddressSavePayload = Omit<Address, "id" | "serviceAreaName">;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/addresses").then((r) => r.json()),
      fetch("/api/service-areas").then((r) => r.json()),
    ])
      .then(([addressData, areaData]) => {
        setAddresses(Array.isArray(addressData) ? addressData : []);
        setServiceAreas(Array.isArray(areaData) ? areaData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(data: AddressSavePayload) {
    setSaving(true);
    try {
      if (editingAddress) {
        // Update existing
        const res = await fetch(`/api/user/addresses/${editingAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          // Refresh addresses
          const addressRes = await fetch("/api/user/addresses");
          const addressData = await addressRes.json();
          setAddresses(addressData);
          setEditingAddress(null);
          setShowForm(false);
        }
      } else {
        // Create new
        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const newAddress = await res.json();
          // Refresh to get updated default status
          const addressRes = await fetch("/api/user/addresses");
          const addressData = await addressRes.json();
          setAddresses(addressData);
          setShowForm(false);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this address?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetDefault(id: number) {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
      }
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  }

  function handleEdit(address: Address) {
    setEditingAddress(address);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingAddress(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-4 font-semibold text-foreground">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <AddressForm
            address={editingAddress || undefined}
            serviceAreas={serviceAreas}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium text-foreground">No saved addresses</p>
          <p className="text-sm text-muted-foreground">
            Add an address for faster checkout
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              deleting={deleting === address.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
