import Link from "next/link";
import { MapPin, Clock, Truck } from "lucide-react";
import type { ServiceArea } from "@/types/service-area";

interface ServiceAreasPreviewProps {
  areas: ServiceArea[];
}

export function ServiceAreasPreview({ areas }: ServiceAreasPreviewProps) {
  if (areas.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              We Deliver To
            </h2>
            <p className="mt-1 text-muted-foreground">
              Fast delivery across these areas in Nairobi
            </p>
          </div>
          <Link
            href="/delivery-areas"
            className="text-sm font-medium text-primary hover:underline"
          >
            All areas
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.slice(0, 6).map((area) => (
            <Link
              key={area.id}
              href={`/delivery-areas/${area.slug}`}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{area.name}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    KES {(area.deliveryFeeCents / 100).toLocaleString()}
                  </span>
                  {area.estimatedTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {area.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
