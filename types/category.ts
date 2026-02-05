export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}
