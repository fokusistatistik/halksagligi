import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Next.js Middleware with NextAuth
 *
 * Bu middleware:
 * 1. NextAuth ile authentication kontrolü yapar
 * 2. İlk giriş yapan kullanıcıları /sifre-degistir sayfasına yönlendirir
 * 3. Public sayfaları korumadan geçirir
 */

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // İlk giriş kontrolü
    if (token?.ilk_giris) {
      // İlk giriş yapan kullanıcı, sadece şifre değiştirme sayfasına ve API'sine erişebilir
      const allowedPaths = ['/sifre-degistir', '/api/sifre-degistir'];
      const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

      if (!isAllowed) {
        return NextResponse.redirect(new URL('/sifre-degistir', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth endpoints)
     * - api/sifre-sifirla (public password reset API)
     * - api/sifre-yenile (public password renew API)
     * - login (login page)
     * - sifre-sifirla (password reset page)
     * - sifre-yenile (password renew page)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/sifre-sifirla|api/sifre-yenile|login|sifre-sifirla|sifre-yenile).*)',
  ],
};
