import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-lg font-semibold text-foreground">
        FnM&apos;s Mini Mart
      </Link>
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-foreground">Reset password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is shown when the user opens the reset link from their email.
          Implement token verification and a new-password form here.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-primary underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
