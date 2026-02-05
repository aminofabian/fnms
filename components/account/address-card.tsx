"use client";

import { MapPin, Phone, User, Star, Edit, Trash2 } from "lucide-react";

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

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  deleting: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting,
}: AddressCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        address.isDefault
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{address.label}</span>
          {address.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Star className="h-3 w-3" />
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(address)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(address.id)}
            disabled={deleting}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-foreground">{address.recipientName}</span>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-foreground">{address.recipientPhone}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-foreground">{address.addressLine}</p>
            {address.serviceAreaName && (
              <p className="text-muted-foreground">{address.serviceAreaName}</p>
            )}
          </div>
        </div>
        {address.notes && (
          <p className="pl-6 text-muted-foreground italic">{address.notes}</p>
        )}
      </div>

      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address.id)}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Set as default
        </button>
      )}
    </div>
  );
}
