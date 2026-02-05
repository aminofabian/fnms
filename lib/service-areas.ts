import { db } from "@/lib/db";

export async function validateServiceArea(areaId: number): Promise<boolean> {
  const { rows } = await db.execute({
    sql: "SELECT is_active FROM service_areas WHERE id = ? LIMIT 1",
    args: [areaId],
  });
  if (rows.length === 0) return false;
  return Boolean((rows[0] as Record<string, unknown>).is_active);
}

export async function getDeliveryFee(areaId: number): Promise<number> {
  const { rows } = await db.execute({
    sql: "SELECT delivery_fee_cents FROM service_areas WHERE id = ? LIMIT 1",
    args: [areaId],
  });
  if (rows.length === 0) return 0;
  return Number((rows[0] as Record<string, unknown>).delivery_fee_cents);
}

export async function getMinOrderAmount(areaId: number): Promise<number> {
  const { rows } = await db.execute({
    sql: "SELECT min_order_cents FROM service_areas WHERE id = ? LIMIT 1",
    args: [areaId],
  });
  if (rows.length === 0) return 0;
  return Number((rows[0] as Record<string, unknown>).min_order_cents);
}
