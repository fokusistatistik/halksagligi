import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        tc_kimlik_no: { label: "TC Kimlik No", type: "text", placeholder: "11 haneli TC Kimlik No" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.tc_kimlik_no || !credentials?.password) {
          throw new Error("TC Kimlik No ve şifre gereklidir");
        }

        try {
          // Kullanıcıyı veritabanından bul
          const personel = await prisma.personel.findUnique({
            where: { tc_kimlik_no: credentials.tc_kimlik_no },
            include: {
              rol: true,
              birim: true
            }
          });

          if (!personel) {
            throw new Error("Geçersiz TC Kimlik No veya şifre");
          }

          // Aktif mi kontrol et
          if (!personel.aktif) {
            throw new Error("Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.");
          }

          // Birim aktif mi kontrol et (Eğer birime bağlıysa)
          if (personel.birim && !personel.birim.aktif) {
            throw new Error("Bağlı olduğunuz birim pasif durumda. Giriş yapamazsınız.");
          }

          // Şifre kontrolü
          const isPasswordValid = await bcrypt.compare(credentials.password, personel.password);

          if (!isPasswordValid) {
            throw new Error("Geçersiz TC Kimlik No veya şifre");
          }

          // Son giriş tarihini güncelle
          await prisma.personel.update({
            where: { id: personel.id },
            data: { son_giris_tarihi: new Date() }
          });

          // Return flat object for NextAuth serialization
          return {
            id: personel.id.toString(),
            tc_kimlik_no: personel.tc_kimlik_no,
            email: personel.email,
            name: `${personel.ad} ${personel.soyad}`,
            ilk_giris: personel.ilk_giris,
            profil_foto_url: personel.profil_foto_url,
            rol: {
              id: personel.rol.id,
              kod: personel.rol.kod,
              ad: personel.rol.ad,
              seviye: personel.rol.seviye,
            },
            birim: personel.birim ? {
              id: personel.birim.id,
              ad: personel.birim.ad,
              kod: personel.birim.kod,
              tip: personel.birim.tip,
            } : null,
          };
        } catch (error) {
          // Re-throw without logging sensitive data
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tc_kimlik_no = (user as any).tc_kimlik_no;
        token.email = user.email;
        token.name = user.name;
        token.ilk_giris = (user as any).ilk_giris;
        token.profil_foto_url = (user as any).profil_foto_url;
        token.rol = (user as any).rol;
        token.birim = (user as any).birim;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).tc_kimlik_no = token.tc_kimlik_no;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
        (session.user as any).ilk_giris = token.ilk_giris;
        (session.user as any).profil_foto_url = token.profil_foto_url;
        (session.user as any).rol = token.rol;
        (session.user as any).birim = token.birim;
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
    maxAge: 12 * 60 * 60, // 12 hours (Mesai süresi güvenliği)
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
