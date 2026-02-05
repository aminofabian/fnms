import { Header } from "@/components/layout/header";

export const metadata = {
  title: "Terms & Conditions | FnM's Mini Mart",
  description: "Terms and conditions for using FnM's Mini Mart.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-KE")}</p>
        <div className="mt-6 space-y-6 text-muted-foreground">
          <section>
            <h2 className="font-semibold text-foreground">1. Use of service</h2>
            <p className="mt-2">
              By using FnM&apos;s Mini Mart you agree to these terms. You must be at least 18 years old
              and provide accurate information when ordering.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">2. Orders and payment</h2>
            <p className="mt-2">
              Orders are subject to availability. We reserve the right to refuse or cancel orders.
              Payment is due as selected at checkout (M-Pesa or cash on delivery). Prices are in KES.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">3. Delivery</h2>
            <p className="mt-2">
              Delivery is only to our designated service areas. You are responsible for providing a
              correct address and being available to receive the order. Risk passes to you on delivery.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">4. Returns and refunds</h2>
            <p className="mt-2">
              Please see our contact page or get in touch for issues with your order. We will work
              with you to resolve problems in line with our refund policy.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">5. Contact</h2>
            <p className="mt-2">
              For questions about these terms, contact us via the Contact page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
