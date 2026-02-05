"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  size = "md",
  showLabel = false,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/wishlist/${productId}`)
        .then((r) => r.json())
        .then((data) => setInWishlist(data.inWishlist))
        .catch(() => {});
    }
  }, [session, productId]);

  async function toggleWishlist() {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
        setInWishlist(false);
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setInWishlist(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (showLabel) {
    return (
      <button
        onClick={toggleWishlist}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
          inWishlist
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
        }`}
      >
        <Heart
          className={`${iconSizes[size]} ${inWishlist ? "fill-current" : ""}`}
        />
        {inWishlist ? "In Wishlist" : "Add to Wishlist"}
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full border transition-all disabled:opacity-50 ${
        inWishlist
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
      }`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`${iconSizes[size]} ${inWishlist ? "fill-current" : ""}`}
      />
    </button>
  );
}
