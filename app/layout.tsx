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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
