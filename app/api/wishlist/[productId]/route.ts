import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/wishlist/[productId] - Remove from wishlist
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await params;

    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    await db.execute({
      sql: "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
      args: [userId, parseInt(productId)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

// GET /api/wishlist/[productId] - Check if product is in wishlist
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ inWishlist: false });
  }

  try {
    const { productId } = await params;

    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ inWishlist: false });
    }

    const userId = Number(userRows[0].id);

    const { rows } = await db.execute({
      sql: "SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1",
      args: [userId, parseInt(productId)],
    });

    return NextResponse.json({ inWishlist: rows.length > 0 });
  } catch (error) {
    console.error("Wishlist check error:", error);
    return NextResponse.json({ inWishlist: false });
  }
}
