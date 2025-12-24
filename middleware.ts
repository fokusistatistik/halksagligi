import { withAuth } from 'next-auth/middleware';

/**
 * Next.js Middleware with NextAuth
 *
 * Bu middleware:
 * 1. NextAuth ile authentication kontrolü yapar
 * 2. Public sayfaları korumadan geçirir
 * 3. Unauthorized kullanıcıları /login'e yönlendirir
 */

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - api/auth (NextAuth endpoints)
     * - api/sifre-sifirla (public password reset API)
     * - api/sifre-yenile (public password renew API)
     * - login (login page)
     * - sifre-sifirla (password reset page)
     * - sifre-yenile (password renew page)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|api/auth|api/sifre-sifirla|api/sifre-yenile|login|sifre-sifirla|sifre-yenile).*)',
  ],
};
