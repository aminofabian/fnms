"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

const PRESET_AMOUNTS_CENTS = [500_00, 1_000_00, 2_000_00, 5_000_00, 10_000_00];
const MIN_CENTS = 100_00;
const MAX_CENTS = 500_000_00;

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
}

export function TopUpModal({ open, onClose }: TopUpModalProps) {
  const [topUpCents, setTopUpCents] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setTopUpCents("");
      setError(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleTopUp(amountCents: number) {
    if (amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
      setError(
        `Amount must be between KES ${(MIN_CENTS / 100).toLocaleString()} and KES ${(MAX_CENTS / 100).toLocaleString()}`
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      const data = (await res.json()) as { error?: string; authorization_url?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start top-up");
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      throw new Error("No redirect URL");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="top-up-modal-title"
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="top-up-modal-title" className="text-lg font-semibold text-foreground">
            Top up wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Add funds via M-Pesa or card. Min KES {(MIN_CENTS / 100).toLocaleString()}, max KES{" "}
            {(MAX_CENTS / 100).toLocaleString()}.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {PRESET_AMOUNTS_CENTS.map((cents) => (
              <button
                key={cents}
                type="button"
                onClick={() => handleTopUp(cents)}
                disabled={loading}
                className="rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                KES {(cents / 100).toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[120px]">
              <label
                htmlFor="top-up-custom-amount"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Custom amount (KES)
              </label>
              <input
                id="top-up-custom-amount"
                type="number"
                min={MIN_CENTS / 100}
                max={MAX_CENTS / 100}
                step={100}
                value={topUpCents === "" ? "" : topUpCents / 100}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") setTopUpCents("");
                  else {
                    const n = Math.round(parseFloat(v) * 100);
                    setTopUpCents(Number.isNaN(n) ? "" : n);
                  }
                }}
                placeholder="e.g. 2500"
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => topUpCents !== "" && handleTopUp(topUpCents)}
              disabled={loading || topUpCents === ""}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Top up
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
