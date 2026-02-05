"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const clampedRating = Math.min(maxStars, Math.max(0, rating));

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxStars }, (_, i) => {
          const filled = i + 1 <= Math.round(clampedRating);
          return (
            <Star
              key={i}
              className={`${sizeClasses[size]} ${
                filled ? "fill-amber-400 text-amber-400" : "text-muted"
              }`}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
