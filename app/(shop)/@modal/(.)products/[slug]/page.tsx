import { notFound } from "next/navigation";
import { ProductQuickViewModal } from "@/components/products/product-quick-view-modal";
import { getProductBySlug } from "@/lib/products/get-product-by-slug";

export default async function ProductQuickViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductQuickViewModal product={product} />;
}
