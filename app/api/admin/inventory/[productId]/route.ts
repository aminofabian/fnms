import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/admin/inventory/[productId] - Update stock
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await params;
    const body = await request.json();
    const { stockQuantity, adjustment } = body;

    // Check if product exists
    const { rows: existing } = await db.execute({
      sql: "SELECT id, stock_quantity FROM products WHERE id = ? LIMIT 1",
      args: [parseInt(productId)],
    });

    if (existing.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentStock = Number(existing[0].stock_quantity);
    let newStock: number;

    if (typeof stockQuantity === "number") {
      // Absolute value
      newStock = Math.max(0, stockQuantity);
    } else if (typeof adjustment === "number") {
      // Relative adjustment (+/-)
      newStock = Math.max(0, currentStock + adjustment);
    } else {
      return NextResponse.json(
        { error: "Provide stockQuantity or adjustment" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "UPDATE products SET stock_quantity = ?, updated_at = datetime('now') WHERE id = ?",
      args: [newStock, parseInt(productId)],
    });

    return NextResponse.json({
      success: true,
      productId: parseInt(productId),
      previousStock: currentStock,
      newStock,
    });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
