"use client";

import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useServiceAreaStore } from "@/stores/service-area-store";

interface ReviewStepProps {
  onBack: () => void;
  onNext: () => void;
}

export function ReviewStep({ onBack, onNext }: ReviewStepProps) {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());
  const selectedArea = useServiceAreaStore((s) => s.selectedArea);
  const delivery = useCheckoutStore((s) => s.delivery);

  const deliveryFeeCents = selectedArea?.deliveryFeeCents ?? 0;
  const minOrderCents = selectedArea?.minOrderCents ?? 0;
  const totalCents = subtotalCents + deliveryFeeCents;
  const belowMinimum = minOrderCents > 0 && subtotalCents < minOrderCents;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Items ({items.length})</h3>
        <div className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId ?? "base"}`}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                {item.snapshot.imageUrl && (
                  <img
                    src={item.snapshot.imageUrl}
                    alt={item.snapshot.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-foreground">{item.snapshot.name}</p>
                  <p className="text-sm text-muted-foreground">
                    KES {((Number(item.snapshot.priceCents) || 0) / 100).toLocaleString()} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">
                KES {((Number(item.snapshot.priceCents) || 0) * (item.quantity || 0) / 100).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Delivery</h3>
        {delivery && selectedArea && (
          <div className="mt-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">{delivery.recipientName}</span>
            </p>
            <p>{delivery.recipientPhone}</p>
            <p>{delivery.deliveryAddress}</p>
            <p className="mt-2">
              Area: {selectedArea.name} (KES {(deliveryFeeCents / 100).toLocaleString()} delivery)
            </p>
          </div>
        )}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">KES {((Number(subtotalCents) || 0) / 100).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="font-medium">KES {(deliveryFeeCents / 100).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="font-semibold">KES {((Number(totalCents) || 0) / 100).toLocaleString()}</dd>
        </div>
      </dl>

      {belowMinimum && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Minimum order for {selectedArea?.name} is KES {(minOrderCents / 100).toLocaleString()}.
          Please add more items.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-md border border-border px-4 py-3 font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={belowMinimum}
          className="flex-1 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
