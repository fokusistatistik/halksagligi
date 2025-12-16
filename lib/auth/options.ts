import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * NextAuth.js Configuration
 *
 * Authentication using TC Kimlik No (as email) + Password
 * JWT-based sessions with Prisma adapter
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        tc_kimlik_no: { label: 'TC Kimlik No', type: 'text' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.tc_kimlik_no || !credentials?.password) {
          throw new Error('TC Kimlik No ve şifre gereklidir');
        }

        // Kullanıcıyı bul
        const personel = await prisma.personel.findUnique({
          where: { tc_kimlik_no: credentials.tc_kimlik_no },
          include: {
            rol: {
              include: {
                yetkiler: {
                  include: {
                    yetki: true,
                  },
                },
              },
            },
            birim: true,
          },
        });

        if (!personel) {
          throw new Error('Kullanıcı bulunamadı');
        }

        // Aktif mi kontrol et
        if (!personel.aktif) {
          throw new Error('Hesabınız aktif değil');
        }

        // Şifre kontrolü
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          personel.password
        );

        if (!isPasswordValid) {
          throw new Error('Hatalı şifre');
        }

        // Son giriş bilgilerini güncelle
        await prisma.personel.update({
          where: { id: personel.id },
          data: {
            son_giris_tarihi: new Date(),
            // IP tracking yapılacaksa ayrı bir middleware'de yapılmalı
          },
        });

        // User object döndür
        return {
          id: personel.id,
          email: personel.email,
          name: `${personel.ad} ${personel.soyad}`,
          tc_kimlik_no: personel.tc_kimlik_no,
          rol: personel.rol,
          birim: personel.birim,
          ilk_giris: personel.ilk_giris,
          profil_foto_url: personel.profil_foto_url,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // İlk login'de user bilgilerini token'a ekle
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.tc_kimlik_no = user.tc_kimlik_no;
        token.rol = user.rol;
        token.birim = user.birim;
        token.ilk_giris = user.ilk_giris;
        token.profil_foto_url = user.profil_foto_url;
      }

      // Session update (örn: şifre değiştirme sonrası)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      // Token'dan session'a bilgileri aktar
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.tc_kimlik_no = token.tc_kimlik_no as string;
        session.user.rol = token.rol as any;
        session.user.birim = token.birim as any;
        session.user.ilk_giris = token.ilk_giris as boolean;
        session.user.profil_foto_url = token.profil_foto_url as string | null;
      }

      return session;
    },
  },

  events: {
    async signIn({ user }) {
      // Login event - audit log yazılabilir
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token }) {
      // Logout event
      console.log(`User signed out: ${token.email}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET,
};
