import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <Link href="/" className="text-lg font-bold text-foreground">
              FnM&apos;s Mini Mart
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your neighbourhood online grocery store.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground">Shop</span>
              <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                Categories
              </Link>
              <Link href="/products" className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <Link href="/delivery-areas" className="text-muted-foreground hover:text-foreground">
                Delivery Areas
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground">Info</span>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
              <Link href="/delivery-info" className="text-muted-foreground hover:text-foreground">
                Delivery Info
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground">Legal</span>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FnM&apos;s Mini Mart. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
