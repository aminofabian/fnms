export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  walletBalanceCents: number;
  blocked: boolean;
  orderCount: number;
  createdAt: string;
}
