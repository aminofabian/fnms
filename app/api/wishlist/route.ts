import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/wishlist - Get user's wishlist
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    // Get wishlist with product details
    const { rows } = await db.execute({
      sql: `SELECT w.id, w.product_id, w.created_at,
                   p.name, p.slug, p.price_cents, p.compare_at_price_cents,
                   p.stock_quantity, p.is_active,
                   (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
            FROM wishlists w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC`,
      args: [userId],
    });

    const items = rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: Number(r.id),
        productId: Number(r.product_id),
        createdAt: String(r.created_at),
        product: {
          name: String(r.name),
          slug: String(r.slug),
          priceCents: Number(r.price_cents),
          compareAtPriceCents: r.compare_at_price_cents ? Number(r.compare_at_price_cents) : null,
          stockQuantity: Number(r.stock_quantity),
          isActive: Boolean(r.is_active),
          imageUrl: r.image_url ? String(r.image_url) : null,
        },
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add product to wishlist
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "number") {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Get user ID
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    // Check if product exists
    const { rows: productRows } = await db.execute({
      sql: "SELECT id FROM products WHERE id = ? LIMIT 1",
      args: [productId],
    });

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already in wishlist
    const { rows: existingRows } = await db.execute({
      sql: "SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1",
      args: [userId, productId],
    });

    if (existingRows.length > 0) {
      return NextResponse.json({ message: "Already in wishlist" }, { status: 200 });
    }

    // Add to wishlist
    await db.execute({
      sql: "INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)",
      args: [userId, productId],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}
