import { OrderList } from "@/components/orders/order-list";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
      <OrderList />
    </div>
  );
}
