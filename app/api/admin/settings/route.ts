import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_KEYS = [
  "store_name",
  "store_email",
  "store_phone",
  "store_address",
  "currency",
  "order_email_enabled",
] as const;

function isAllowedKey(key: string): key is (typeof ALLOWED_KEYS)[number] {
  return (ALLOWED_KEYS as readonly string[]).includes(key);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await db.execute({
      sql: "SELECT key, value FROM settings",
      args: [],
    });

    const settings: Record<string, string> = {};
    for (const row of rows) {
      const r = row as { key: string; value: string | null };
      settings[r.key] = r.value ?? "";
    }

    return NextResponse.json(settings);
  } catch (e) {
    console.error("Admin settings GET:", e);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role?.toLowerCase() !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Body must be an object of key-value pairs" },
        { status: 400 }
      );
    }

    const updates: Array<{ key: string; value: string }> = [];
    for (const [key, value] of Object.entries(body)) {
      if (!isAllowedKey(key)) continue;
      updates.push({ key, value: value == null ? "" : String(value) });
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    const now = new Date().toISOString();
    for (const { key, value } of updates) {
      await db.execute({
        sql: `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        args: [key, value, now],
      });
    }

    const { rows } = await db.execute({
      sql: "SELECT key, value FROM settings",
      args: [],
    });
    const settings: Record<string, string> = {};
    for (const row of rows) {
      const r = row as { key: string; value: string | null };
      settings[r.key] = r.value ?? "";
    }

    return NextResponse.json({ ok: true, updated: updates.length, settings });
  } catch (e) {
    console.error("Admin settings PATCH:", e);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
