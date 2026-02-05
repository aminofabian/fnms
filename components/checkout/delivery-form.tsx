"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { MapPin, Navigation, MapPinned } from "lucide-react";
import dynamic from "next/dynamic";
import { deliverySchema, type DeliveryInput } from "@/lib/validations/checkout";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useServiceAreaStore } from "@/stores/service-area-store";
import type { ServiceArea } from "@/types/service-area";
import type { DeliveryInfo } from "@/types/checkout";

const MapAddressPicker = dynamic(
  () => import("./map-address-picker").then((m) => m.MapAddressPicker),
  { ssr: false, loading: () => <div className="h-[240px] animate-pulse rounded-xl bg-muted/30" /> }
);

const LAST_DELIVERY_KEY = "fnms_last_delivery";

/** Shape we persist to localStorage (matches DeliveryInfo) */
function getStoredDelivery(): Partial<DeliveryInfo> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_DELIVERY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed.serviceAreaId === "number") {
      return {
        serviceAreaId: parsed.serviceAreaId,
        recipientName: typeof parsed.recipientName === "string" ? parsed.recipientName : "",
        recipientPhone: typeof parsed.recipientPhone === "string" ? parsed.recipientPhone : "",
        deliveryAddress: typeof parsed.deliveryAddress === "string" ? parsed.deliveryAddress : "",
        deliveryNotes: typeof parsed.deliveryNotes === "string" ? parsed.deliveryNotes : "",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function setStoredDelivery(d: DeliveryInfo) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_DELIVERY_KEY, JSON.stringify(d));
  } catch {
    // ignore
  }
}

/** Save delivery to user's saved addresses (create or update default). */
async function saveDeliveryToAccount(data: DeliveryInfo): Promise<void> {
  const res = await fetch("/api/user/addresses");
  if (!res.ok) return;
  const addresses = (await res.json()) as Array<{ id: number; isDefault?: boolean }>;
  const payload = {
    label: "Default",
    recipientName: data.recipientName,
    recipientPhone: data.recipientPhone,
    serviceAreaId: data.serviceAreaId,
    addressLine: data.deliveryAddress,
    notes: data.deliveryNotes || undefined,
    isDefault: true,
  };
  if (addresses.length > 0) {
    const toUpdate = addresses.find((a) => a.isDefault) ?? addresses[0];
    await fetch(`/api/user/addresses/${toUpdate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

interface DeliveryFormProps {
  onNext: () => void;
}

export function DeliveryForm({ onNext }: DeliveryFormProps) {
  const { data: session } = useSession();
  const { delivery, setDelivery } = useCheckoutStore();
  const { selectedArea, setSelectedArea } = useServiceAreaStore();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lon: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryInput>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      serviceAreaId: 0,
      recipientName: "",
      recipientPhone: "",
      deliveryAddress: "",
      deliveryNotes: "",
    },
  });

  const serviceAreaId = watch("serviceAreaId");
  const showAreaButtons = areas.length > 0 && areas.length < 5;

  // Fetch areas and compute prepopulation (store > default address > localStorage)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const areasRes = await fetch("/api/service-areas").then((r) => r.json());
      const areaList = Array.isArray(areasRes) ? areasRes as ServiceArea[] : [];
      if (cancelled) return;
      setAreas(areaList);

      // 1) From checkout store (e.g. user went back from review)
      if (delivery?.serviceAreaId && areaList.some((a) => a.id === delivery.serviceAreaId)) {
        reset({
          serviceAreaId: delivery.serviceAreaId,
          recipientName: delivery.recipientName ?? "",
          recipientPhone: delivery.recipientPhone ?? "",
          deliveryAddress: delivery.deliveryAddress ?? "",
          deliveryNotes: delivery.deliveryNotes ?? "",
        });
        if (!cancelled) setLoading(false);
        return;
      }

      // 2) Logged-in: try default saved address
      if (session?.user) {
        try {
          const addrRes = await fetch("/api/user/addresses");
          if (addrRes.ok) {
            const addresses = (await addrRes.json()) as Array<{
              serviceAreaId: number;
              recipientName: string;
              recipientPhone: string;
              addressLine: string;
              notes?: string | null;
              isDefault?: boolean;
            }>;
            const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
            if (
              defaultAddr &&
              defaultAddr.serviceAreaId &&
              areaList.some((a) => a.id === defaultAddr.serviceAreaId)
            ) {
              reset({
                serviceAreaId: defaultAddr.serviceAreaId,
                recipientName: defaultAddr.recipientName ?? "",
                recipientPhone: defaultAddr.recipientPhone ?? "",
                deliveryAddress: defaultAddr.addressLine ?? "",
                deliveryNotes: defaultAddr.notes ?? "",
              });
              if (!cancelled) setLoading(false);
              return;
            }
          }
        } catch {
          // fall through to localStorage
        }
      }

      // 3) localStorage (last delivery)
      const stored = getStoredDelivery();
      if (
        stored?.serviceAreaId &&
        areaList.some((a) => a.id === stored.serviceAreaId)
      ) {
        reset({
          serviceAreaId: stored.serviceAreaId,
          recipientName: stored.recipientName ?? "",
          recipientPhone: stored.recipientPhone ?? "",
          deliveryAddress: stored.deliveryAddress ?? "",
          deliveryNotes: stored.deliveryNotes ?? "",
        });
      } else {
        // 4) At least set area from service area store if valid
        const areaId = selectedArea?.id && areaList.some((a) => a.id === selectedArea.id)
          ? selectedArea.id
          : 0;
        reset({
          serviceAreaId: areaId,
          recipientName: "",
          recipientPhone: "",
          deliveryAddress: "",
          deliveryNotes: "",
        });
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [delivery, session?.user, selectedArea?.id, reset]);

  useEffect(() => {
    if (serviceAreaId && serviceAreaId > 0) {
      const area = areas.find((a) => a.id === serviceAreaId);
      if (area) setSelectedArea(area);
    }
  }, [serviceAreaId, areas, setSelectedArea]);

  async function handleUseLocation() {
    if (!navigator?.geolocation) {
      setLocationError("Location is not supported by your browser.");
      return;
    }
    setLocationError(null);
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });
      const { latitude, longitude } = position.coords;
      setLastCoords({ lat: latitude, lon: longitude });
      const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
      const data = (await res.json()) as { address?: string; error?: string };
      if (data?.error || !data?.address) {
        setLocationError(data?.error ?? "Could not get address for your location.");
        return;
      }
      setValue("deliveryAddress", data.address, { shouldValidate: true });
      setMapExpanded(false);
    } catch (e) {
      const code = e && typeof e === "object" && "code" in e ? (e as { code: number }).code : 0;
      const message =
        code === 1
          ? "Location permission denied. You can type your address instead."
          : code === 2 || code === 3
            ? "Could not get your location. Try again or type your address."
            : "Something went wrong. Try again or type your address.";
      setLocationError(message);
    } finally {
      setLocationLoading(false);
    }
  }

  function handleMapAddressSelect(address: string) {
    setValue("deliveryAddress", address, { shouldValidate: true });
    setLocationError(null);
  }

  async function onSubmit(data: DeliveryInput) {
    setDelivery(data);
    setStoredDelivery(data);
    if (session?.user) {
      try {
        await saveDeliveryToAccount(data);
      } catch {
        // Non-blocking; localStorage and store already updated
      }
    }
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">
          Delivery Area *
        </label>
        {loading ? (
          <div className="h-12 rounded-xl border border-border bg-muted/30 animate-pulse" />
        ) : showAreaButtons ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {areas.map((area) => {
              const selected = serviceAreaId === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setValue("serviceAreaId", area.id, { shouldValidate: true })}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="block">{area.name}</span>
                  <span className="text-muted-foreground">
                    KES {(area.deliveryFeeCents / 100).toLocaleString()} delivery
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <select
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("serviceAreaId", { valueAsNumber: true })}
          >
            <option value={0}>Select your area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} – KES {(area.deliveryFeeCents / 100).toLocaleString()} delivery
              </option>
            ))}
          </select>
        )}
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
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
        <div className="mb-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            Help us find you
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Include: street or road name, building or apartment name/number, house number, floor or wing, and a nearby landmark (e.g. shop, school, church).
          </p>
          <p className="mt-2 text-xs text-muted-foreground italic">
            Example: Orange House, Apt 3B, 2nd floor, near City Mall
          </p>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locationLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 disabled:opacity-50"
          >
            {locationLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use my current location
          </button>
          <button
            type="button"
            onClick={() => setMapExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50"
          >
            <MapPinned className="h-4 w-4" />
            {mapExpanded ? "Hide map" : "Set location on map"}
          </button>
        </div>
        {locationError && (
          <p className="mb-2 text-sm text-destructive">{locationError}</p>
        )}
        {mapExpanded && (
          <div className="mb-3">
            <MapAddressPicker
              initialCenter={lastCoords ? [lastCoords.lat, lastCoords.lon] : null}
              onAddressSelect={handleMapAddressSelect}
              onError={setLocationError}
            />
          </div>
        )}
        <textarea
          rows={3}
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. Juja Mall, Shop 12, 1st floor, next to Naivas"
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
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Any special instructions..."
          {...register("deliveryNotes")}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-md hover:opacity-95 disabled:opacity-50"
      >
        Continue to Review
      </button>
    </form>
  );
}
