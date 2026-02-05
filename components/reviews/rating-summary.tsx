"use client";

import { Star } from "lucide-react";
import { StarRating } from "./star-rating";
import type { ReviewSummary } from "@/types/review";

interface RatingSummaryProps {
  summary: ReviewSummary;
  size?: "sm" | "md" | "lg";
}

export function RatingSummary({ summary, size = "md" }: RatingSummaryProps) {
  const { averageRating, totalCount, distribution } = summary;
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-6">
        {/* Average */}
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          </p>
          <StarRating rating={averageRating} maxStars={5} size={size} />
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 min-w-[180px] space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-6 text-sm text-muted-foreground">{star}</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
