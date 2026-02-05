/**
 * Set a user's role to admin by email.
 * Run: bun run scripts/promote-admin.ts your@email.com
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const email = process.argv[2];

if (!url) {
  console.error("Missing TURSO_DATABASE_URL");
  process.exit(1);
}

if (!email) {
  console.error("Usage: bun run scripts/promote-admin.ts <email>");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

async function main() {
  const { rows } = await db.execute({
    sql: "SELECT id, email, role FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });

  if (rows.length === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const user = rows[0];
  if (String(user.role) === "admin") {
    console.log(`${email} is already an admin.`);
    return;
  }

  await db.execute({
    sql: "UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE id = ?",
    args: [user.id],
  });

  console.log(`✓ ${email} is now an admin. You can log in and go to /admin`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
