import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Product, ProductImage } from "@/types/product";

const PRODUCTS_PER_PAGE = 40;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const filter = searchParams.get("filter") || "all";
        const categorySlug = searchParams.get("category") || null;

        const offset = (page - 1) * PRODUCTS_PER_PAGE;

        // Build base query conditions
        let whereConditions = ["is_active = 1"];
        const args: (string | number)[] = [];

        // Apply filters
        switch (filter) {
            case "deals":
                whereConditions.push("compare_at_cents IS NOT NULL AND compare_at_cents > price_cents");
                break;
            case "new":
                // Products created in last 7 days
                whereConditions.push("created_at >= datetime('now', '-7 days')");
                break;
            case "inStock":
                whereConditions.push("stock_quantity > 0");
                break;
            case "lowStock":
                whereConditions.push("stock_quantity > 0 AND stock_quantity <= 10");
                break;
            case "popular":
                // Popular = deals for now (can be enhanced with analytics)
                whereConditions.push("compare_at_cents IS NOT NULL AND compare_at_cents > price_cents");
                break;
        }

        // Apply category filter if specified
        if (categorySlug) {
            // Get category ID from slug
            const { rows: categoryRows } = await db.execute({
                sql: "SELECT id FROM categories WHERE slug = ?",
                args: [categorySlug],
            });

            if (categoryRows.length > 0) {
                whereConditions.push("category_id = ?");
                args.push(Number(categoryRows[0].id));
            }
        }

        const whereClause = whereConditions.join(" AND ");

        // Get total count for pagination
        const { rows: countRows } = await db.execute({
            sql: `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`,
            args,
        });
        const totalProducts = Number(countRows[0].total);
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

        // Get paginated products
        const { rows } = await db.execute({
            sql: `SELECT * FROM products WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            args: [...args, PRODUCTS_PER_PAGE, offset],
        });

        const products: Product[] = rows.map((r) => ({
            id: Number(r.id),
            categoryId: Number(r.category_id),
            slug: String(r.slug),
            name: String(r.name),
            description: r.description ? String(r.description) : null,
            priceCents: Number(r.price_cents),
            compareAtCents: r.compare_at_cents ? Number(r.compare_at_cents) : null,
            unit: r.unit ? String(r.unit) : null,
            stockQuantity: Number(r.stock_quantity),
            isActive: Boolean(r.is_active),
            createdAt: String(r.created_at),
            updatedAt: String(r.updated_at),
            images: [],
        }));

        // Get images for products
        if (products.length > 0) {
            const productIds = products.map((p) => p.id);
            const placeholders = productIds.map(() => "?").join(",");
            const { rows: imageRows } = await db.execute({
                sql: `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
                args: productIds,
            });

            const imagesByProduct = new Map<number, ProductImage[]>();
            for (const img of imageRows) {
                const productId = Number(img.product_id);
                if (!imagesByProduct.has(productId)) {
                    imagesByProduct.set(productId, []);
                }
                imagesByProduct.get(productId)!.push({
                    id: Number(img.id),
                    productId,
                    url: String(img.url),
                    alt: img.alt ? String(img.alt) : null,
                    sortOrder: Number(img.sort_order),
                });
            }

            for (const product of products) {
                product.images = imagesByProduct.get(product.id) ?? [];
            }
        }

        return NextResponse.json({
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                productsPerPage: PRODUCTS_PER_PAGE,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching paginated products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
