"use client";

import { useCartStore } from "@/stores/cart-store";
import { useServiceAreaStore } from "@/stores/service-area-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { PromoInput } from "./promo-input";
import type { PromoValidation } from "@/types/promo";

interface OrderSummaryProps {
  showPromoInput?: boolean;
}

export function OrderSummary({ showPromoInput = true }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.getSubtotalCents());
  const selectedArea = useServiceAreaStore((s) => s.selectedArea);
  const delivery = useCheckoutStore((s) => s.delivery);
  const promo = useCheckoutStore((s) => s.promo);
  const setPromo = useCheckoutStore((s) => s.setPromo);

  const deliveryFeeCents = selectedArea?.deliveryFeeCents ?? 0;
  const discountCents = promo?.valid ? (promo.discountCents ?? 0) : 0;
  const totalCents = subtotalCents + deliveryFeeCents - discountCents;

  function handleApplyPromo(newPromo: PromoValidation) {
    setPromo(newPromo);
  }

  function handleRemovePromo() {
    setPromo(null);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Order Summary</h3>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {item.snapshot.name} × {item.quantity}
            </span>
            <span className="font-medium">
              KES {((Number(item.snapshot.priceCents) || 0) * (item.quantity || 0) / 100).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      {showPromoInput && (
        <div className="mt-4 border-t border-border pt-4">
          <PromoInput
            subtotalCents={subtotalCents}
            appliedPromo={promo}
            onApply={handleApplyPromo}
            onRemove={handleRemovePromo}
          />
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">KES {((Number(subtotalCents) || 0) / 100).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Delivery ({selectedArea?.name ?? "—"})
          </dt>
          <dd className="font-medium">KES {(deliveryFeeCents / 100).toLocaleString()}</dd>
        </div>
        {discountCents > 0 && (
          <div className="flex justify-between text-green-600">
            <dt>Discount ({promo?.code})</dt>
            <dd className="font-medium">-KES {(discountCents / 100).toLocaleString()}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt className="font-semibold text-foreground">Total</dt>
          <dd className="font-semibold">KES {(totalCents / 100).toLocaleString()}</dd>
        </div>
      </dl>

      {delivery && (
        <div className="mt-4 border-t border-border pt-4 text-sm">
          <p className="font-medium text-foreground">Delivery to:</p>
          <p className="mt-1 text-muted-foreground">{delivery.recipientName}</p>
          <p className="text-muted-foreground">{delivery.recipientPhone}</p>
          <p className="text-muted-foreground">{delivery.deliveryAddress}</p>
          {delivery.deliveryNotes && (
            <p className="mt-1 text-xs text-muted-foreground italic">
              Note: {delivery.deliveryNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
