import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await db.execute({
          sql: "SELECT id, email, name, role, password_hash FROM users WHERE email = ? LIMIT 1",
          args: [credentials.email],
        });

        const row = rows[0];
        if (!row || typeof row.password_hash !== "string") return null;

        const ok = await bcrypt.compare(credentials.password, row.password_hash);
        if (!ok) return null;

        return {
          id: String(row.id),
          email: String(row.email),
          name: row.name ? String(row.name) : null,
          role: String(row.role),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  // NextAuth requires a secret for JWT signing. In dev, fallback to a default if unset.
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "fnms-dev-secret-change-in-production-min-32-chars"
      : undefined),
};
