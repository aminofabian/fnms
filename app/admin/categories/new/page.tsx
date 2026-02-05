import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to categories
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-foreground">Add Category</h1>
      <p className="mt-1 text-muted-foreground">Create a new product category.</p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
