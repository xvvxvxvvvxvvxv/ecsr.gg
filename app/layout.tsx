import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECS:R CC",
  description: "press space to flip",
  icons: {
    icon: "https://images.dahood.vip/logo_R.ico",
  },
  openGraph: {
    title: "ECS:R CC",
    description: "press space to flip",
    type: "website",
    siteName: "ECS:R CC",
    images: ["https://images.dahood.vip/mrbeast.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECS:R CC",
    description: "press space to flip",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
