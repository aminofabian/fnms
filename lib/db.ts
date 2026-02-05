import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Missing TURSO_DATABASE_URL in environment");
}

// authToken required for Turso (libsql://); optional for local file:
export const db = createClient(
  authToken ? { url, authToken } : { url }
);
