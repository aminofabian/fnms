/**
 * Apply sql/init.sql to your Turso database.
 * Loads .env from project root (Bun does this automatically).
 *
 * Run: bun run scripts/init-db.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL. Set it in .env or .env.local");
  process.exit(1);
}

const db = createClient(authToken ? { url, authToken } : { url });

const sqlPath = join(process.cwd(), "sql", "init.sql");
let sql = readFileSync(sqlPath, "utf-8");
// Remove lines that are only comments
sql = sql
  .split("\n")
  .map((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("--") ? "" : line;
  })
  .join("\n");

// Split by semicolon only when not inside parentheses
function splitStatements(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) {
      const stmt = text.slice(start, i).trim();
      if (stmt.length > 0 && !stmt.startsWith("--")) out.push(stmt);
      start = i + 1;
    }
  }
  const last = text.slice(start).trim();
  if (last.length > 0 && !last.startsWith("--")) out.push(last);
  return out;
}

const statements = splitStatements(sql);
for (const statement of statements) {
  await db.execute(statement);
}

console.log("Schema applied successfully.");
