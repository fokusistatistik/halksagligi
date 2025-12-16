<<<<<<< HEAD
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Halk Sağlığı Müdürü routes
    if (path.startsWith("/dashboard/personel") &&
        !["admin", "halk_sagligi_mudur"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
=======
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 *
 * Bu middleware:
 * 1. Authentication kontrolü yapar
 * 2. İlk giriş yapan kullanıcıları /sifre-degistir sayfasına yönlendirir
 * 3. Public sayfaları korumadan geçirir
 */

// Public sayfalar (authentication gerektirmeyen)
const publicPaths = [
  '/login',
  '/sifre-sifirla',
  '/sifre-yenile',
  '/api/login',
  '/api/sifre-sifirla',
  '/api/sifre-yenile',
];

// İlk giriş yapan kullanıcılar için izin verilen sayfalar
const firstLoginAllowedPaths = [
  '/sifre-degistir',
  '/api/sifre-degistir',
  '/login', // Logout için
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static dosyalar ve Next.js internal dosyalarını geç
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public sayfalar için authentication kontrolü yapma
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Cookie'den auth token al
  const authToken = request.cookies.get('auth_token')?.value;

  // Eğer token yoksa login'e yönlendir
  if (!authToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Token'ı decode et (basit bir örnek, production'da JWT verify yapılmalı)
  // NOT: Production'da bu kısım JWT verify ile yapılmalı
  try {
    // İlk giriş flag'ini cookie'den al
    const ilkGiris = request.cookies.get('ilk_giris')?.value === 'true';

    // İlk giriş yapan kullanıcı kontrolü
    if (ilkGiris) {
      // İlk giriş yapan kullanıcı, sadece şifre değiştirme sayfasına erişebilir
      if (!firstLoginAllowedPaths.some((path) => pathname.startsWith(path))) {
        const url = request.nextUrl.clone();
        url.pathname = '/sifre-degistir';
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Token geçersiz, login'e yönlendir
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
>>>>>>> 688cb8399544cb48ad1e4bd218a7ee9d5f50d8fd
  ],
};
