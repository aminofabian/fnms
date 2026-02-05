"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";

interface CheckResult {
  supported: boolean;
  name?: string;
  message: string;
}

interface AreaCheckerProps {
  /** Called when we confirm we deliver to an area (pass the area name so parent can set selection) */
  onAreaFound?: (areaName: string) => void;
}

export function AreaChecker({ onAreaFound }: AreaCheckerProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const slug = query.toLowerCase().trim().replace(/\s+/g, "-");
      const res = await fetch(`/api/service-areas/check?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setResult(data);
      if (data.supported && data.name && onAreaFound) {
        onAreaFound(data.name);
      }
    } catch {
      setResult({ supported: false, message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Check your area</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your area name to see if we deliver there.
      </p>

      <form onSubmit={handleCheck} className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Mirema, Roysambu"
          className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : <Search className="h-4 w-4" />}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-md p-3 ${
            result.supported ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"
          }`}
        >
          {result.supported ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-orange-600" />
          )}
          <span className="text-sm">{result.message}</span>
        </div>
      )}
    </div>
  );
}
