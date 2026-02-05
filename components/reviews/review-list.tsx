"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Pencil } from "lucide-react";
import { RatingSummary } from "./rating-summary";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import type { Review, ReviewSummary } from "@/types/review";

interface ReviewListProps {
  productSlug: string;
  productId: number;
}

interface ReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
  currentUserReviewId?: number | null;
}

export function ReviewList({ productSlug, productId }: ReviewListProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchReviews();
        setEditingReview(null);
      }
    } finally {
      setDeleting(null);
    }
  }

  function handleSuccess() {
    fetchReviews();
    setShowForm(false);
    setEditingReview(null);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-card" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = data?.reviews ?? [];
  const summary = data?.summary ?? {
    averageRating: 0,
    totalCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const myReviewId = data?.currentUserReviewId ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <MessageSquare className="h-5 w-5" />
          Customer Reviews
        </h2>
        {session?.user && !showForm && !editingReview && (
          <button
            onClick={() => {
              const myReview = myReviewId ? reviews.find((r) => r.id === myReviewId) : null;
              if (myReview) setEditingReview(myReview);
              else setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
            {myReviewId ? "Edit your review" : "Write a review"}
          </button>
        )}
      </div>

      {data && <RatingSummary summary={summary} />}

      {(showForm || editingReview) && session?.user && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 font-medium text-foreground">
            {editingReview ? "Edit your review" : "Write a review"}
          </h3>
          <ReviewForm
            productSlug={productSlug}
            existingReview={editingReview}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingReview(null);
            }}
          />
        </div>
      )}

      {reviews.length === 0 && !showForm ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium text-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to review this product
          </p>
          {session?.user && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Write a review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={myReviewId === review.id}
              onEdit={myReviewId === review.id ? setEditingReview : undefined}
              onDelete={myReviewId === review.id ? handleDelete : undefined}
              deleting={deleting === review.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
