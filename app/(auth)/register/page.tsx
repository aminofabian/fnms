import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-lg font-semibold text-foreground">
        FnM&apos;s Mini Mart
      </Link>
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
