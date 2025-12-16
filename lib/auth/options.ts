import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email", placeholder: "ornek@saglik.gov.tr" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre gereklidir");
        }

        try {
          // Webhook ile kullanıcı doğrulama
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL}/kullanici-giris`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(process.env.WEBHOOK_API_KEY && {
                  "X-API-Key": process.env.WEBHOOK_API_KEY,
                }),
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Giriş başarısız");
          }

          const data = await response.json();

          if (data.success && data.data) {
            return {
              id: data.data.id,
              name: data.data.name,
              email: data.data.email,
              role: data.data.role,
              birim_id: data.data.birim_id,
              avatar: data.data.avatar,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.birim_id = (user as any).birim_id;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).birim_id = token.birim_id;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
