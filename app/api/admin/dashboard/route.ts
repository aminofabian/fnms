import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  
  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Execute all queries in parallel
    const [
      todayOrdersResult,
      todaySalesResult,
      pendingOrdersResult,
      totalOrdersResult,
      totalCustomersResult,
      lowStockResult,
      recentOrdersResult,
      topProductsResult,
      ordersByStatusResult,
      salesByDayResult,
    ] = await Promise.all([
      // Today's orders count
      db.execute({
        sql: `SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date(?)`,
        args: [todayStr],
      }),
      // Today's sales
      db.execute({
        sql: `SELECT COALESCE(SUM(total_cents), 0) as total FROM orders 
              WHERE date(created_at) = date(?) AND status != 'CANCELLED'`,
        args: [todayStr],
      }),
      // Pending orders
      db.execute({
        sql: `SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'`,
        args: [],
      }),
      // Total orders (all time)
      db.execute({
        sql: `SELECT COUNT(*) as count FROM orders`,
        args: [],
      }),
      // Total customers
      db.execute({
        sql: `SELECT COUNT(*) as count FROM users WHERE role = 'customer' OR role IS NULL`,
        args: [],
      }),
      // Low stock products (stock <= 10)
      db.execute({
        sql: `SELECT id, name, slug, stock_quantity FROM products 
              WHERE stock_quantity <= 10 AND is_active = 1
              ORDER BY stock_quantity ASC LIMIT 5`,
        args: [],
      }),
      // Recent orders (last 5)
      db.execute({
        sql: `SELECT o.id, o.order_number, o.status, o.total_cents, o.created_at,
                     u.name as customer_name
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              ORDER BY o.created_at DESC LIMIT 5`,
        args: [],
      }),
      // Top selling products (last 30 days)
      db.execute({
        sql: `SELECT p.id, p.name, p.slug, SUM(oi.quantity) as total_sold
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              JOIN orders o ON oi.order_id = o.id
              WHERE o.created_at >= datetime('now', '-30 days')
                AND o.status != 'CANCELLED'
              GROUP BY p.id
              ORDER BY total_sold DESC
              LIMIT 5`,
        args: [],
      }),
      // Orders by status
      db.execute({
        sql: `SELECT status, COUNT(*) as count FROM orders GROUP BY status`,
        args: [],
      }),
      // Sales by day (last 7 days)
      db.execute({
        sql: `SELECT date(created_at) as date, 
                     COUNT(*) as orders,
                     COALESCE(SUM(total_cents), 0) as sales
              FROM orders
              WHERE created_at >= datetime('now', '-7 days')
                AND status != 'CANCELLED'
              GROUP BY date(created_at)
              ORDER BY date ASC`,
        args: [],
      }),
    ]);

    // Format response
    const stats = {
      todayOrders: Number(todayOrdersResult.rows[0]?.count) || 0,
      todaySales: Number(todaySalesResult.rows[0]?.total) || 0,
      pendingOrders: Number(pendingOrdersResult.rows[0]?.count) || 0,
      totalOrders: Number(totalOrdersResult.rows[0]?.count) || 0,
      totalCustomers: Number(totalCustomersResult.rows[0]?.count) || 0,
    };

    const lowStockProducts = lowStockResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      stockQuantity: Number(row.stock_quantity),
    }));

    const recentOrders = recentOrdersResult.rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      totalCents: Number(row.total_cents),
      createdAt: row.created_at,
      customerName: row.customer_name || "Guest",
    }));

    const topProducts = topProductsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      totalSold: Number(row.total_sold),
    }));

    const ordersByStatus = ordersByStatusResult.rows.reduce(
      (acc, row) => {
        acc[row.status as string] = Number(row.count);
        return acc;
      },
      {} as Record<string, number>
    );

    const salesByDay = salesByDayResult.rows.map((row) => ({
      date: row.date,
      orders: Number(row.orders),
      sales: Number(row.sales),
    }));

    return NextResponse.json({
      stats,
      lowStockProducts,
      recentOrders,
      topProducts,
      ordersByStatus,
      salesByDay,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
