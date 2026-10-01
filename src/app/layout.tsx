import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import LazyMotionProvider from "@/components/fx/LazyMotionProvider";
import ResetScroll from "@/components/ui/reset-scroll";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onsetproduction.netlify.app"),
  title: "onsetproduction | Music. EP. On-Set. — Shoot. Rent. Create.",
  description:
    "Ultra-modern film production studio & equipment rental platform for high-energy music videos, EPs, commercials, and cinema gear rentals.",
  keywords: [
    "film production",
    "music video director",
    "EP visualizer",
    "camera rental",
    "cinema gear rental",
    "onsetproduction",
    "ARRI Alexa Mini LF",
    "RED V-Raptor",
  ],
  authors: [{ name: "onsetproduction" }],
  openGraph: {
    title: "onsetproduction | Music. EP. On-Set.",
    description: "Cinematic film production & professional cinema gear rental studio.",
    url: "https://onsetproduction.netlify.app",
    siteName: "onsetproduction",
    images: [
      {
        url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "onsetproduction studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "onsetproduction | Music. EP. On-Set.",
    description: "Cinematic film production & professional cinema gear rental studio.",
    images: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop"],
  },
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
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} dark`}>
      <body className="bg-black text-neutral-100 font-sans antialiased selection:bg-red-600 selection:text-black">
        <ResetScroll />
        <LazyMotionProvider>{children}</LazyMotionProvider>
      </body>
    </html>
  );
}
