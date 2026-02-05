import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    const { rows: existing } = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    await db.execute({
      sql: "INSERT INTO users (email, name, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')",
      args: [email, name, phone, password_hash],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
