import { MapPin, ShoppingCart, Truck, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Select Your Area",
    description: "Choose your delivery location from our service areas",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Browse our fresh products and add items to your cart",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "We deliver to your doorstep within hours",
  },
  {
    icon: CheckCircle,
    title: "Enjoy Fresh",
    description: "Receive quality groceries and enjoy freshness",
  },
];

export function HowItWorks() {
  return (
    <section className="rounded-2xl border border-black/10 bg-card/60 px-4 py-10 shadow-sm backdrop-blur-sm sm:px-6 sm:py-12 md:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          How it works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Getting fresh groceries has never been easier
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative">
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:h-16 sm:w-16">
                <step.icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
              </div>
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
