"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, MapPin, Loader2 } from "lucide-react";
import { useServiceAreaConfirmStore } from "@/stores/service-area-confirm-store";
import type { ServiceArea } from "@/types/service-area";

export function ServiceAreaConfirmDialog() {
  const { isOpen, pending, close, confirm } = useServiceAreaConfirmStore();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) {
      setAreas([]);
      return;
    }
    setLoading(true);
    fetch("/api/service-areas")
      .then((res) => res.json())
      .then((data) => {
        setAreas(Array.isArray(data) ? data : []);
      })
      .catch(() => setAreas([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-area-confirm-title"
      aria-describedby="service-area-confirm-desc"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <h2
              id="service-area-confirm-title"
              className="text-lg font-semibold text-foreground"
            >
              Delivery area
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col min-h-0 overflow-hidden">
          <p id="service-area-confirm-desc" className="text-sm text-muted-foreground shrink-0">
            We deliver to selected areas only. Are you within one of our delivery zones?
          </p>

          <div className="mt-4 shrink-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Areas we serve
            </p>
            {loading ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>Loading areas…</span>
              </div>
            ) : areas.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No delivery areas available.</p>
            ) : (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/30 py-1">
                {areas.map((area) => (
                  <li
                    key={area.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">{area.name}</span>
                    {area.deliveryFeeCents > 0 ? (
                      <span className="text-xs text-muted-foreground shrink-0">
                        KES {(area.deliveryFeeCents / 100).toLocaleString()} delivery
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground shrink-0">Free delivery</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end shrink-0">
            <Link
              href="/delivery-areas"
              onClick={close}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              View full list
            </Link>
            <button
              type="button"
              onClick={confirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Yes, I&apos;m in your area
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
