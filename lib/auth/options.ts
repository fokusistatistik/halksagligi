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
              tc_kimlik_no: data.data.tc_kimlik_no || '',
              rol: data.data.rol || data.data.role,
              birim: data.data.birim,
              ilk_giris: data.data.ilk_giris || false,
              profil_foto_url: data.data.profil_foto_url || null,
            };
          }

          return null;
        } catch (_error) {
          console.error("Auth error:", _error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tc_kimlik_no = (user as any).tc_kimlik_no;
        token.rol = (user as any).rol;
        token.birim = (user as any).birim;
        token.ilk_giris = (user as any).ilk_giris;
        token.profil_foto_url = (user as any).profil_foto_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).tc_kimlik_no = token.tc_kimlik_no;
        (session.user as any).rol = token.rol;
        (session.user as any).birim = token.birim;
        (session.user as any).ilk_giris = token.ilk_giris;
        (session.user as any).profil_foto_url = token.profil_foto_url;
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
