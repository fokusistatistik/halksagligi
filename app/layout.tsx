import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kocaeli İSM - Görev Yönetim Sistemi',
  description: 'Kocaeli İl Sağlık Müdürlüğü Görev Yönetim Sistemi',
  keywords: [
    'Kocaeli',
    'İl Sağlık Müdürlüğü',
    'Görev Yönetimi',
    'KISM',
    'Sağlık',
  ],
  authors: [{ name: 'FOKUS İstatistik' }],
  creator: 'FOKUS İstatistik',
  publisher: 'Kocaeli İl Sağlık Müdürlüğü',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="HSB Görev" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HSB Görev" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#14a0b5" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="https://static.fokusistatistik.com/resimler/favicon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="https://static.fokusistatistik.com/resimler/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://static.fokusistatistik.com/resimler/favicon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="https://static.fokusistatistik.com/resimler/favicon.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="https://static.fokusistatistik.com/resimler/favicon.png" />
        <link rel="shortcut icon" href="https://static.fokusistatistik.com/resimler/favicon.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
