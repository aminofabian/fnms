import { Check, Clock, Package, Truck, Home, X } from "lucide-react";
import type { OrderStatus } from "@/types/order";

interface OrderTimelineProps {
  status: OrderStatus;
}

const steps = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: Check },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

const statusOrder: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: -1,
};

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = statusOrder[status];

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
          <X className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-orange-800">Order Cancelled</p>
          <p className="text-sm text-orange-600">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-8 h-8 w-0.5 ${
                    isComplete ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
            <div className="pb-8">
              <p
                className={`font-medium ${
                  isComplete || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
