import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWalletBalance } from "@/lib/wallet";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const balanceCents = await getWalletBalance(session.user.id);
    return NextResponse.json({
      balanceCents,
      currency: "KES",
    });
  } catch (error) {
    console.error("Wallet GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}
