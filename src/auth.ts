import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ── Extend session types ──────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasShop: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
    hasShop: boolean;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { shop: true },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hasShop: !!user.shop,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Au login initial, on copie les données du user
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.hasShop = user.hasShop;
      }

      // Pour les sellers, on relit hasShop depuis la DB
      // mais on entoure d'un try/catch pour ne jamais crasher la session
      if (token.id && token.role === "SELLER") {
        try {
          const shop = await prisma.shop.findUnique({
            where: { ownerId: token.id as string },
            select: { id: true },
          });
          token.hasShop = !!shop;
        } catch {
          // En cas d'erreur DB, on garde la valeur existante du token
          // pour éviter que /api/auth/session retourne du HTML
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hasShop = token.hasShop as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirects internes
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});
