"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaRequestSchema, type AreaRequestInput } from "@/lib/validations/service-area";

export function AreaRequestForm() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AreaRequestInput>({
    resolver: zodResolver(areaRequestSchema),
    defaultValues: { areaName: "", contactEmail: "" },
  });

  async function onSubmit(data: AreaRequestInput) {
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/service-areas/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong");
        return;
      }

      setSuccess(true);
      reset();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-lg font-semibold text-foreground">Thank you!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll notify you when we start delivering to your area.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-medium text-primary underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground">Request your area</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Don&apos;t see your area? Let us know and we&apos;ll try to expand there.
      </p>

      {error && (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="areaName" className="mb-1 block text-sm font-medium text-foreground">
            Area name
          </label>
          <input
            id="areaName"
            type="text"
            placeholder="e.g. Kahawa West"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("areaName")}
          />
          {errors.areaName && (
            <p className="mt-1 text-sm text-destructive">{errors.areaName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-foreground">
            Your email
          </label>
          <input
            id="contactEmail"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("contactEmail")}
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-destructive">{errors.contactEmail.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
