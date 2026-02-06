"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Wallet, ArrowLeft, Loader2, Plus } from "lucide-react";
import { TopUpModal } from "@/components/wallet/top-up-modal";

interface WalletTransaction {
  id: number;
  type: string;
  amountCents: number;
  referenceType: string | null;
  referenceId: string | null;
  balanceAfterCents: number;
  description: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const { data: session } = useSession();
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/wallet").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/wallet/transactions?limit=50").then((res) =>
        res.ok ? res.json() : { transactions: [] }
      ),
    ])
      .then(([walletData, txData]) => {
        setBalanceCents((walletData as { balanceCents?: number } | null)?.balanceCents ?? null);
        setTransactions((txData as { transactions?: WalletTransaction[] })?.transactions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Sign in to view your wallet.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/account"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-foreground">Wallet</h1>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    KES {((balanceCents ?? 0) / 100).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTopUpModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Top up
              </button>
            </div>
          </div>

          <TopUpModal open={topUpModalOpen} onClose={() => setTopUpModalOpen(false)} />

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Transaction history</h2>
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your wallet at checkout or top up to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const isCredit = tx.amountCents > 0;
                  const date = new Date(tx.createdAt).toLocaleString("en-KE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.description ?? tx.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={
                            isCredit
                              ? "font-semibold text-green-600"
                              : "font-semibold text-foreground"
                          }
                        >
                          {isCredit ? "+" : ""}KES {(tx.amountCents / 100).toLocaleString()}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Balance: KES {(tx.balanceAfterCents / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
