import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/cart - Get cart for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] });
    }

    const userId = session.user.id;
    const { rows } = await db.execute({
      sql: `SELECT ci.id, ci.product_id, ci.variant_id, ci.quantity, p.slug, p.name, p.price_cents, p.unit, p.stock_quantity
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = ?
            ORDER BY ci.created_at`,
      args: [userId],
    });

    const items = rows.map((row) => {
      const r = row as Record<string, unknown>;
      let priceCents = Number(r.price_cents);
      // TODO: if variant_id, get variant price
      return {
        productId: Number(r.product_id),
        variantId: r.variant_id != null ? Number(r.variant_id) : undefined,
        quantity: Number(r.quantity),
        snapshot: {
          productId: Number(r.product_id),
          slug: String(r.slug),
          name: String(r.name),
          priceCents,
          imageUrl: null as string | null,
          unit: r.unit ? String(r.unit) : null,
          stockQuantity: Number(r.stock_quantity),
        },
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("Cart GET error:", e);
    return NextResponse.json({ error: "Failed to get cart" }, { status: 500 });
  }
}

// POST /api/cart - Sync cart (replace server cart with body items for logged-in user)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as { items: { productId: number; variantId?: number; quantity: number }[] };
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    const userId = session.user.id;
    const cartId = userId;

    await db.execute({
      sql: "DELETE FROM cart_items WHERE user_id = ?",
      args: [userId],
    });

    for (const it of items) {
      if (it.quantity < 1) continue;
      await db.execute({
        sql: "INSERT INTO cart_items (cart_id, user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?, ?)",
        args: [cartId, userId, it.productId, it.variantId ?? null, it.quantity],
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cart POST error:", e);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: true });
    }

    await db.execute({
      sql: "DELETE FROM cart_items WHERE user_id = ?",
      args: [session.user.id],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cart DELETE error:", e);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
