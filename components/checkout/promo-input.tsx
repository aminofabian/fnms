"use client";

import { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import type { PromoValidation } from "@/types/promo";

interface PromoInputProps {
  subtotalCents: number;
  appliedPromo: PromoValidation | null;
  onApply: (promo: PromoValidation) => void;
  onRemove: () => void;
}

export function PromoInput({
  subtotalCents,
  appliedPromo,
  onApply,
  onRemove,
}: PromoInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!code.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotalCents }),
      });

      const data: PromoValidation = await res.json();

      if (data.valid) {
        onApply(data);
        setCode("");
      } else {
        setError(data.message || "Invalid promo code");
      }
    } catch {
      setError("Failed to validate code");
    } finally {
      setLoading(false);
    }
  }

  if (appliedPromo?.valid) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <div>
              <span className="font-mono font-bold text-green-600">
                {appliedPromo.code}
              </span>
              <span className="ml-2 text-sm text-green-600">
                {appliedPromo.discountType === "PERCENTAGE"
                  ? `${appliedPromo.discountValue}% off`
                  : `KES ${((appliedPromo.discountValue || 0) / 100).toLocaleString()} off`}
              </span>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="rounded p-1 text-green-600 hover:bg-green-500/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-green-600">
          You save KES {((appliedPromo.discountCents || 0) / 100).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter promo code"
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-foreground uppercase placeholder:text-muted-foreground placeholder:normal-case focus:border-primary focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
