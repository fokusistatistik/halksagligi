import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kocaeli İl Sağlık Müdürlüğü - Görev Yönetim Sistemi",
  description: "Halk Sağlığı Başkanlığı Görev Takip ve Yönetim Platformu",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
