"use client";

import { StarRating } from "./star-rating";
import type { Review } from "@/types/review";

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (id: number) => void;
  deleting?: boolean;
}

export function ReviewCard({
  review,
  isOwn,
  onEdit,
  onDelete,
  deleting,
}: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm font-medium text-foreground">
              {review.userName ?? "Customer"}
            </span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          {review.body && (
            <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
          )}
        </div>
        {isOwn && onEdit && onDelete && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(review)}
              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(review.id)}
              disabled={deleting}
              className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
