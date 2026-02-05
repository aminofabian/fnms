import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, MapPin, Users, Settings, ClipboardList, Boxes, Ticket } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="text-lg font-bold text-foreground">
            FnM&apos;s Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Package className="h-4 w-4" />
            Categories
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <ShoppingCart className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Boxes className="h-4 w-4" />
            Inventory
          </Link>
          <Link
            href="/admin/service-areas"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <MapPin className="h-4 w-4" />
            Service Areas
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <ClipboardList className="h-4 w-4" />
            Orders
          </Link>
          <Link
            href="/admin/promotions"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Ticket className="h-4 w-4" />
            Promotions
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold text-foreground lg:hidden">Admin</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to store
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
