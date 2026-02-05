"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219]; // Nairobi
const DEFAULT_ZOOM = 15;

interface MapAddressPickerProps {
  /** Initial center [lat, lng] */
  initialCenter?: [number, number] | null;
  onAddressSelect: (address: string, lat: number, lon: number) => void;
  onError?: (message: string) => void;
}

export function MapAddressPicker({
  initialCenter,
  onAddressSelect,
  onError,
}: MapAddressPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ map: import("leaflet").Map; marker: import("leaflet").Marker } | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !el) return;

      const center: [number, number] = initialCenter ?? DEFAULT_CENTER;
      const map = L.map(el).setView(center, DEFAULT_ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const marker = L.marker(center, { draggable: true, icon }).addTo(map);

      async function updateAddress(lat: number, lon: number) {
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
          const data = (await res.json()) as { address?: string };
          if (data?.address && !cancelled) onAddressSelect(data.address, lat, lon);
        } catch {
          if (!cancelled) onError?.("Could not get address for this location.");
        }
      }

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        updateAddress(pos.lat, pos.lng);
      });

      // Get address for initial position
      updateAddress(center[0], center[1]);

      if (!cancelled) {
        mapRef.current = { map, marker };
        setReady(true);
        setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, onAddressSelect, onError]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/30">
      <div
        ref={containerRef}
        className="h-[240px] w-full"
        style={{ minHeight: 240 }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-sm text-muted-foreground">
          {loading ? "Loading map…" : "Map unavailable"}
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Drag the marker to your delivery location. Address updates automatically.
      </p>
    </div>
  );
}
