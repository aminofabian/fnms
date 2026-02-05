import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = "FNMSDelivery/1.0 (https://fnms.co.ke; delivery address)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const latNum = lat ? parseFloat(lat) : NaN;
  const lonNum = lon ? parseFloat(lon) : NaN;
  if (Number.isNaN(latNum) || Number.isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return NextResponse.json({ error: "Valid lat and lon required" }, { status: 400 });
  }

  try {
    const url = `${NOMINATIM_URL}?lat=${latNum}&lon=${lonNum}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
    }
    const data = (await res.json()) as { display_name?: string; address?: Record<string, string> };
    const address = data?.display_name ?? "";
    return NextResponse.json({ address: address.trim() || "Address not found" });
  } catch (e) {
    console.error("[geocode/reverse]", e);
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
