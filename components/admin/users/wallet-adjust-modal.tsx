"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import type { AdminUser } from "@/types/admin-user";

interface WalletAdjustModalProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

function formatKes(cents: number): string {
  return `KES ${(cents / 100).toLocaleString()}`;
}

export function WalletAdjustModal({
  user,
  onClose,
  onSuccess,
}: WalletAdjustModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(cents) || cents === 0) {
      setError("Enter a valid amount (e.g. 500 or -100 for debit).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAdjustmentCents: cents,
          walletDescription: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wallet");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Adjust wallet
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {user.name || user.email} — current balance:{" "}
          <strong className="text-foreground">
            {formatKes(user.walletBalanceCents)}
          </strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-foreground">
              Amount (KES)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g. 500 or -100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Positive to credit, negative to debit.
            </p>
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
              Reason (optional)
            </label>
            <input
              id="description"
              type="text"
              placeholder="e.g. Refund for order #123"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Updating…" : "Update wallet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
