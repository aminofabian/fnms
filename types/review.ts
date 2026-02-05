export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>; // 1-5 -> count
}
