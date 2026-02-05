import { AreaForm } from "@/components/admin/service-areas";

export default function NewServiceAreaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Service Area</h1>
        <p className="text-muted-foreground">
          Create a new delivery zone
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <AreaForm />
      </div>
    </div>
  );
}
