import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WikiTok — Wikipedia Race Feed",
  description:
    "Watch an AI agent race through Wikipedia links in a TikTok-style feed. Predict how many clicks it takes!",
  openGraph: {
    title: "WikiTok",
    description: "TikTok meets Wikipedia. Watch AI agents race through links.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8f9fa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
        />
      </head>
      <body
        className={`${jetBrainsMono.variable} antialiased bg-[#f8f9fa] text-[#202122]`}
        style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, 'Times New Roman', serif" }}
      >
        {children}
      </body>
    </html>
  );
}
