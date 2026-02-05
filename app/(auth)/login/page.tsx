import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-lg font-semibold text-foreground">
        FnM&apos;s Mini Mart
      </Link>
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="animate-pulse rounded-lg bg-muted py-12" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
