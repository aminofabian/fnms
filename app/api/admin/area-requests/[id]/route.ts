import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/admin/area-requests/[id] - Update request status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "reviewed", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if request exists
    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM area_requests WHERE id = ? LIMIT 1",
      args: [parseInt(id)],
    });

    if (existing.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await db.execute({
      sql: "UPDATE area_requests SET status = ?, updated_at = datetime('now') WHERE id = ?",
      args: [status, parseInt(id)],
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Update area request error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
