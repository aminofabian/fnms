import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MapPin, Clock, Truck } from "lucide-react";

export const metadata = {
  title: "Delivery Information | FnM's Mini Mart",
  description: "How delivery works at FnM's Mini Mart.",
};

export default function DeliveryInfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Delivery Information</h1>
        <div className="mt-6 space-y-8 text-muted-foreground">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Service areas</h2>
              <p className="mt-2">
                We deliver to selected neighbourhoods. Check the{" "}
                <Link href="/delivery-areas" className="text-primary hover:underline">
                  Delivery Areas
                </Link>{" "}
                page to see if we serve your location. Each area has a delivery fee and minimum
                order; these are shown when you select your area.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Delivery times</h2>
              <p className="mt-2">
                We aim to deliver within the estimated time for your area. You’ll see the estimated
                time when you select your delivery location. Orders are processed and sent out as
                quickly as possible.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">At delivery</h2>
              <p className="mt-2">
                Our driver will bring your order to your door. For cash on delivery, please have
                the exact amount ready. You can add delivery notes at checkout (e.g. gate code,
                landmark) to help the driver find you.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-8">
          <Link href="/delivery-areas" className="text-primary hover:underline">
            View delivery areas →
          </Link>
        </p>
      </main>
    </div>
  );
}
