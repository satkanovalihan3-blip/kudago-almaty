import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KudaGo Almaty - Гид по местам и событиям города",
  description: "Откройте для себя лучшие места Алматы: рестораны, бары, достопримечательности, события и развлечения на интерактивной карте",
  keywords: ["Алматы", "гид", "карта", "события", "рестораны", "развлечения", "куда пойти"],
  authors: [{ name: "KudaGo Almaty" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "KudaGo Almaty",
    description: "Гид по местам и событиям Алматы",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
