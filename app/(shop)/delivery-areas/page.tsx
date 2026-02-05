import { AreaList } from "@/components/service-areas/area-list";
import { AreaChecker } from "@/components/service-areas/area-checker";
import { AreaRequestForm } from "@/components/service-areas/area-request-form";
import Link from "next/link";

export const metadata = {
  title: "Delivery Areas | FnM's Mini Mart",
  description: "Check if we deliver to your area. View our delivery zones and fees.",
};

export default function DeliveryAreasPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-foreground">
            FnM&apos;s Mini Mart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Delivery Areas</h1>
        <p className="mt-2 text-muted-foreground">
          We currently deliver to the following areas in Nairobi.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-foreground">Our service areas</h2>
          <div className="mt-4">
            <AreaList />
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <AreaChecker />
          <AreaRequestForm />
        </section>
      </main>
    </div>
  );
}
