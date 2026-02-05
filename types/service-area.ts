export interface ServiceArea {
  id: number;
  slug: string;
  name: string;
  deliveryFeeCents: number;
  minOrderCents: number;
  estimatedTime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAreaInput {
  slug: string;
  name: string;
  deliveryFeeCents?: number;
  minOrderCents?: number;
  estimatedTime?: string;
  isActive?: boolean;
}

export interface AreaRequest {
  id: number;
  areaName: string;
  contactEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface AreaRequestInput {
  areaName: string;
  contactEmail: string;
}
