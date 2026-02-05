"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliverySchema, type DeliveryInput } from "@/lib/validations/checkout";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useServiceAreaStore } from "@/stores/service-area-store";
import type { ServiceArea } from "@/types/service-area";

interface DeliveryFormProps {
  onNext: () => void;
}

export function DeliveryForm({ onNext }: DeliveryFormProps) {
  const { delivery, setDelivery } = useCheckoutStore();
  const { selectedArea, setSelectedArea } = useServiceAreaStore();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryInput>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      serviceAreaId: delivery?.serviceAreaId ?? selectedArea?.id ?? 0,
      recipientName: delivery?.recipientName ?? "",
      recipientPhone: delivery?.recipientPhone ?? "",
      deliveryAddress: delivery?.deliveryAddress ?? "",
      deliveryNotes: delivery?.deliveryNotes ?? "",
    },
  });

  const serviceAreaId = watch("serviceAreaId");

  useEffect(() => {
    fetch("/api/service-areas")
      .then((res) => res.json())
      .then((data) => {
        setAreas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (serviceAreaId && serviceAreaId > 0) {
      const area = areas.find((a) => a.id === serviceAreaId);
      if (area) setSelectedArea(area);
    }
  }, [serviceAreaId, areas, setSelectedArea]);

  function onSubmit(data: DeliveryInput) {
    setDelivery(data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Delivery Area *
        </label>
        <select
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          {...register("serviceAreaId", { valueAsNumber: true })}
        >
          <option value={0}>Select your area</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name} – KES {(area.deliveryFeeCents / 100).toLocaleString()} delivery
            </option>
          ))}
        </select>
        {errors.serviceAreaId && (
          <p className="mt-1 text-sm text-destructive">{errors.serviceAreaId.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Recipient Name *
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Full name"
            {...register("recipientName")}
          />
          {errors.recipientName && (
            <p className="mt-1 text-sm text-destructive">{errors.recipientName.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Phone Number *
          </label>
          <input
            type="tel"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0712345678"
            {...register("recipientPhone")}
          />
          {errors.recipientPhone && (
            <p className="mt-1 text-sm text-destructive">{errors.recipientPhone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Delivery Address *
        </label>
        <textarea
          rows={2}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Building, street, landmarks..."
          {...register("deliveryAddress")}
        />
        {errors.deliveryAddress && (
          <p className="mt-1 text-sm text-destructive">{errors.deliveryAddress.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Delivery Notes (optional)
        </label>
        <textarea
          rows={2}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Any special instructions..."
          {...register("deliveryNotes")}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        Continue to Review
      </button>
    </form>
  );
}
