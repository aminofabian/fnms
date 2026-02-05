"use client";

import { useState, useEffect } from "react";
import type { ServiceArea } from "@/types/service-area";

interface Address {
  id?: number;
  label: string;
  recipientName: string;
  recipientPhone: string;
  serviceAreaId: number;
  addressLine: string;
  notes: string | null;
  isDefault: boolean;
}

interface AddressFormProps {
  address?: Address;
  serviceAreas: ServiceArea[];
  onSave: (data: Omit<Address, "id">) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export function AddressForm({
  address,
  serviceAreas,
  onSave,
  onCancel,
  saving,
}: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<Address, "id">>({
    label: "Home",
    recipientName: "",
    recipientPhone: "",
    serviceAreaId: 0,
    addressLine: "",
    notes: null,
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        serviceAreaId: address.serviceAreaId,
        addressLine: address.addressLine,
        notes: address.notes,
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Label */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Label *
          </label>
          <select
            value={formData.label}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, label: e.target.value }))
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Service Area */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Delivery Area *
          </label>
          <select
            value={formData.serviceAreaId}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                serviceAreaId: parseInt(e.target.value),
              }))
            }
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value={0}>Select area...</option>
            {serviceAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Recipient Name *
          </label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, recipientName: e.target.value }))
            }
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.recipientPhone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, recipientPhone: e.target.value }))
            }
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="07XXXXXXXX"
          />
        </div>
      </div>

      {/* Address Line */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Address *
        </label>
        <input
          type="text"
          value={formData.addressLine}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, addressLine: e.target.value }))
          }
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          placeholder="Building, street, apartment..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Delivery Notes
        </label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value || null }))
          }
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
          placeholder="Any special instructions for delivery..."
        />
      </div>

      {/* Default checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))
          }
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-foreground">Set as default address</span>
      </label>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || formData.serviceAreaId === 0}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : address ? "Update Address" : "Add Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
