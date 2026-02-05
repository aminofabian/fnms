"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Placeholder: replace with your password-reset API (e.g. send email link)
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
        <p className="mt-2 text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent instructions to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-primary underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold text-foreground">Forgot password</h2>
      <p className="text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <Link
        href="/login"
        className="text-center text-sm font-medium text-primary underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}
