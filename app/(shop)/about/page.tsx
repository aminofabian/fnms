import Link from "next/link";
import { Header } from "@/components/layout/header";

export const metadata = {
  title: "About Us | FnM's Mini Mart",
  description: "Learn about FnM's Mini Mart – your local online grocery delivery service.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">About FnM&apos;s Mini Mart</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>
            FnM&apos;s Mini Mart is your neighbourhood online grocery store. We deliver fresh produce,
            household essentials, and everyday items straight to your door across selected areas.
          </p>
          <p>
            We focus on quality, fair prices, and reliable delivery so you can shop from home
            with confidence.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-foreground">Our promise</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Fresh products, carefully sourced</li>
            <li>Transparent pricing with no hidden fees</li>
            <li>Friendly, on-time delivery</li>
            <li>Customer support when you need it</li>
          </ul>
        </div>
        <p className="mt-8">
          <Link href="/contact" className="text-primary hover:underline">
            Get in touch →
          </Link>
        </p>
      </main>
    </div>
  );
}
