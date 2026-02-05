import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ProductGrid } from "@/components/products/product-grid";
import { SearchBar } from "@/components/products/search-bar";
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb";

export const metadata = {
  title: "Products | FnM's Mini Mart",
  description: "Browse our full range of groceries and household essentials.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <CategoryBreadcrumb />

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-foreground">All Products</h1>
          <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />}>
            <SearchBar />
          </Suspense>
        </div>

        <section className="mt-8">
          <ProductGrid />
        </section>
      </main>
    </div>
  );
}
