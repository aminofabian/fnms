import { Header } from "@/components/layout/header";

export const metadata = {
  title: "Privacy Policy | FnM's Mini Mart",
  description: "Privacy policy for FnM's Mini Mart.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-KE")}</p>
        <div className="mt-6 space-y-6 text-muted-foreground">
          <section>
            <h2 className="font-semibold text-foreground">1. Information we collect</h2>
            <p className="mt-2">
              We collect information you provide when you register, place orders, or contact us,
              such as name, email, phone number, and delivery address. We also collect usage data
              to improve our service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">2. How we use it</h2>
            <p className="mt-2">
              We use your information to process orders, deliver products, communicate with you,
              and improve our website and services. We do not sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">3. Security</h2>
            <p className="mt-2">
              We take reasonable steps to protect your data. Passwords are stored securely and
              payment details are handled in line with applicable practices.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">4. Your rights</h2>
            <p className="mt-2">
              You can request access to or correction of your personal data. You may also request
              deletion of your account subject to our legal and operational requirements.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-foreground">5. Contact</h2>
            <p className="mt-2">
              For privacy-related questions, contact us via the Contact page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
