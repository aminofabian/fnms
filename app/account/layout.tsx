import Link from "next/link";
import { User, Package, MapPin, Settings, ArrowLeft, Heart } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md lg:hidden">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <span className="font-semibold text-foreground">My Account</span>
          <div className="w-20" />
        </div>
      </header>

      <div className="container mx-auto flex gap-8 px-4 py-8">
        {/* Sidebar - desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-8 rounded-xl border border-border bg-card p-4">
            <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to shop
            </Link>
            <h2 className="mb-4 text-lg font-bold text-foreground">My Account</h2>
            <nav className="space-y-1">
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                href="/account/addresses"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <MapPin className="h-4 w-4" />
                Addresses
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
