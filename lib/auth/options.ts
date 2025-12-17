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
        console.log('🔐 Authorize başladı:', credentials?.tc_kimlik_no);

        if (!credentials?.tc_kimlik_no || !credentials?.password) {
          console.error('❌ Credentials eksik');
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

          console.log('👤 Personel bulundu:', personel ? 'Evet' : 'Hayır');

          if (!personel) {
            console.error('❌ Kullanıcı bulunamadı');
            throw new Error("Geçersiz TC Kimlik No veya şifre");
          }

          // Aktif mi kontrol et
          if (!personel.aktif) {
            console.error('❌ Kullanıcı aktif değil');
            throw new Error("Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.");
          }

          // Şifre kontrolü
          const isPasswordValid = await bcrypt.compare(credentials.password, personel.password);
          console.log('🔑 Şifre doğrulaması:', isPasswordValid ? 'Başarılı' : 'Başarısız');

          if (!isPasswordValid) {
            console.error('❌ Şifre hatalı');
            throw new Error("Geçersiz TC Kimlik No veya şifre");
          }

          // Son giriş tarihini güncelle
          await prisma.personel.update({
            where: { id: personel.id },
            data: { son_giris_tarihi: new Date() }
          });

          console.log('✅ Login başarılı:', personel.ad, personel.soyad);

          return {
            id: personel.id,
            name: `${personel.ad} ${personel.soyad}`,
            email: personel.email,
            tc_kimlik_no: personel.tc_kimlik_no,
            rol: personel.rol,
            birim: personel.birim,
            ilk_giris: personel.ilk_giris,
            profil_foto_url: personel.profil_foto_url,
          };
        } catch (error) {
          console.error('💥 Authorize error:', error);
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
