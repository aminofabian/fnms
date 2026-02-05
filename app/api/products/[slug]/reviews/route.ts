import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { Review, ReviewSummary } from "@/types/review";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).optional(),
});

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    productId: Number(row.product_id),
    rating: Number(row.rating),
    body: row.body ? String(row.body) : null,
    isApproved: Boolean(row.is_approved),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    userName: row.user_name ? String(row.user_name) : undefined,
  };
}

// GET /api/products/[slug]/reviews - List reviews for a product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    // Get product id
    const { rows: productRows } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = Number(productRows[0].id);

    // Get approved reviews with masked user name for privacy
    const { rows } = await db.execute({
      sql: `SELECT r.*,
                   CASE WHEN u.name IS NOT NULL AND trim(u.name) != '' 
                        THEN substr(trim(u.name), 1, 1) || '.***' 
                        ELSE 'Customer' END as user_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.is_approved = 1
            ORDER BY r.created_at DESC`,
      args: [productId],
    });

    const reviews = rows.map((row) => rowToReview(row as Record<string, unknown>));

    // If logged in, get current user's review id for edit/delete
    let currentUserReviewId: number | null = null;
    if (session?.user?.email) {
      const { rows: userRows } = await db.execute({
        sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
        args: [session.user.email],
      });
      if (userRows.length > 0) {
        const userId = Number(userRows[0].id);
        const myReview = reviews.find((r) => r.userId === userId);
        if (myReview) currentUserReviewId = myReview.id;
      }
    }

    // Get summary (average, count, distribution)
    const { rows: summaryRows } = await db.execute({
      sql: `SELECT rating, COUNT(*) as count
            FROM reviews
            WHERE product_id = ? AND is_approved = 1
            GROUP BY rating`,
      args: [productId],
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalCount = 0;
    let sumRating = 0;

    for (const row of summaryRows) {
      const r = row as Record<string, unknown>;
      const rating = Number(r.rating);
      const count = Number(r.count);
      distribution[rating] = count;
      totalCount += count;
      sumRating += rating * count;
    }

    const summary: ReviewSummary = {
      averageRating: totalCount > 0 ? sumRating / totalCount : 0,
      totalCount,
      distribution,
    };

    return NextResponse.json({
      reviews,
      summary,
      currentUserReviewId,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/products/[slug]/reviews - Create or update review (one per user per product)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const input = await req.json();
    const parsed = reviewSchema.safeParse(input);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get user id
    const { rows: userRows } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [session.user.email],
    });

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = Number(userRows[0].id);

    // Get product id
    const { rows: productRows } = await db.execute({
      sql: "SELECT id FROM products WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = Number(productRows[0].id);

    // Optional: verify purchase (user has a delivered order containing this product)
    const { rows: orderRows } = await db.execute({
      sql: `SELECT 1 FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
            LIMIT 1`,
      args: [userId, productId],
    });

    const isVerifiedPurchase = orderRows.length > 0;

    // Check for existing review
    const { rows: existingRows } = await db.execute({
      sql: "SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1",
      args: [userId, productId],
    });

    const rating = parsed.data.rating;
    const reviewBody = parsed.data.body ?? null;

    if (existingRows.length > 0) {
      // Update existing review
      await db.execute({
        sql: "UPDATE reviews SET rating = ?, body = ?, updated_at = datetime('now') WHERE id = ?",
        args: [rating, reviewBody, Number(existingRows[0].id)],
      });

      const { rows } = await db.execute({
        sql: "SELECT * FROM reviews WHERE id = ? LIMIT 1",
        args: [Number(existingRows[0].id)],
      });

      return NextResponse.json({
        review: rowToReview(rows[0] as Record<string, unknown>),
        updated: true,
      });
    }

    // Insert new review (auto-approve for simplicity, or set is_approved = 0 for moderation)
    await db.execute({
      sql: "INSERT INTO reviews (user_id, product_id, rating, body, is_approved) VALUES (?, ?, ?, ?, 1)",
      args: [userId, productId, rating, reviewBody],
    });

    const { rows } = await db.execute({
      sql: "SELECT * FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1",
      args: [userId, productId],
    });

    return NextResponse.json(
      {
        review: rowToReview(rows[0] as Record<string, unknown>),
        verifiedPurchase: isVerifiedPurchase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
