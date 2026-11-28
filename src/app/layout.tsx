import type { Metadata } from "next";
import { Suspense } from "react";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StorefrontOnly } from "@/components/layout/StorefrontOnly";
import { Providers } from "@/components/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "RORE CLUB | Anime Merch & Streetwear",
  description: "Shop anime-inspired graphic tees, hoodies and fandom accessories. Made to order and shipped across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Suspense fallback={null}><StorefrontOnly><Header /></StorefrontOnly></Suspense>
            <main className="site-main flex-1">{children}</main>
            <Suspense fallback={null}><StorefrontOnly><Footer /></StorefrontOnly></Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}
