import { Header } from "@/components/layout/header";

export const metadata = {
  title: "FAQ | FnM's Mini Mart",
  description: "Frequently asked questions about ordering and delivery.",
};

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse products on the homepage or categories, add items to your cart, and proceed to checkout. You’ll need to sign in or register, choose your delivery area, enter your address and payment method, then place the order.",
  },
  {
    q: "Which areas do you deliver to?",
    a: "We deliver to selected service areas. Use the delivery area selector in the header or visit the Delivery Areas page to see if we serve your location. You can also request your area if it’s not listed.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa and cash on delivery. You can choose your preferred option at checkout.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "You can cancel orders that are still pending or confirmed from your account order history. Once the order is processing or out for delivery, please contact us to request changes.",
  },
  {
    q: "How do I track my order?",
    a: "Log in and go to Account → Orders. Click on an order to see its status and delivery details.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
        <div className="mt-6 space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-semibold text-foreground">{item.q}</h2>
              <p className="mt-2 text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
