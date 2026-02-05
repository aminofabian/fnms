import { Header } from "@/components/layout/header";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact Us | FnM's Mini Mart",
  description: "Get in touch with FnM's Mini Mart.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
            <p className="text-muted-foreground">
              Send us a message and we&apos;ll get back to you as soon as we can.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <ContactForm />
        </div>
      </main>
    </div>
  );
}
