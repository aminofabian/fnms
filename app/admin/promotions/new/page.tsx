import { PromoForm } from "@/components/admin/promo";

export default function NewPromoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Promo Code</h1>
        <p className="text-muted-foreground">
          Add a new promotional discount code
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <PromoForm />
      </div>
    </div>
  );
}
