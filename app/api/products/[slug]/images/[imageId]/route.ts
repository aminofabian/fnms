import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// DELETE /api/products/[slug]/images/[imageId] - Remove image from product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; imageId: string }> }
) {
  try {
    const { slug, imageId } = await params;
    const id = Number(imageId);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
    }

    const { rows: productRows } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });
    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { rows: imageRows } = await db.execute({
      sql: "SELECT id FROM product_images WHERE id = ? AND product_id = ? LIMIT 1",
      args: [id, (productRows[0] as Record<string, unknown>).id],
    });
    if (imageRows.length === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM product_images WHERE id = ?",
      args: [id],
    });

    revalidatePath(`/products/${slug}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Product image DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
