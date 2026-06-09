import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import BackgroundCanvas from "@/components/layout/BackgroundCanvas";
import { ClientAppWrapper } from "@/components/layout/ClientAppWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIOV Capital | Premium Gold Trading Community",
  description:
    "Join 5,000+ traders accessing 8-10 daily gold signals with a verified 91% win rate. Professional-grade analysis, real results.",
  keywords: [
    "AIOV Capital",
    "gold trading",
    "XAU/USD",
    "gold signals",
    "trading community",
    "bitcoin trading",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/aiov-capital-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased noise-overlay">
        <BackgroundCanvas />
        <ClientAppWrapper>{children}</ClientAppWrapper>
      </body>
    </html>
  );
}
