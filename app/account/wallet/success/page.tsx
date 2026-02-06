"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wallet, CheckCircle, Loader2 } from "lucide-react";

function WalletTopUpSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("Missing reference");
      setLoading(false);
      return;
    }
    fetch(`/api/wallet/top-up/status?reference=${encodeURIComponent(reference)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: { amountCents?: number }) => setAmountCents(data.amountCents ?? null))
      .catch(() => setError("Could not load top-up details"))
      .finally(() => setLoading(false));
  }, [reference]);

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Confirming your top-up…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">{error}</p>
            <Link
              href="/account/wallet"
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground"
            >
              Back to Wallet
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-foreground">Wallet topped up</h1>
            <p className="mt-2 text-2xl font-semibold text-primary">
              KES {((amountCents ?? 0) / 100).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your balance has been updated. You can use it at checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/account/wallet"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Wallet className="h-4 w-4" />
                View Wallet
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium hover:bg-accent"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WalletTopUpSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md space-y-8">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          </div>
        </div>
      }
    >
      <WalletTopUpSuccessContent />
    </Suspense>
  );
}
