import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { JsonLdOrganization } from "@/components/seo/json-ld";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FnM's Mini Mart | Fresh Groceries Delivered",
  description: "Shop fresh groceries, everyday essentials, and more—all delivered to your door in Nairobi. Fast delivery, great prices.",
  keywords: ["grocery", "mini mart", "online shopping", "fresh produce", "delivery", "Kenya", "groceries", "essentials", "Nairobi"],
  authors: [{ name: "FnM's Mini Mart" }],
  creator: "FnM's Mini Mart",
  publisher: "FnM's Mini Mart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://fmns.co.ke"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FnM's Mini Mart | Fresh Groceries Delivered",
    description: "Shop fresh groceries, everyday essentials, and more—all delivered to your door in Nairobi.",
    url: "https://fmns.co.ke",
    siteName: "FnM's Mini Mart",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/fnms.png",
        width: 1200,
        height: 630,
        alt: "FnM's Mini Mart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FnM's Mini Mart | Fresh Groceries Delivered",
    description: "Shop fresh groceries, everyday essentials, and more—all delivered to your door.",
    images: ["/fnms.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FnM's Mini Mart",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#9ACD32" },
    { media: "(prefers-color-scheme: dark)", color: "#9ACD32" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        <JsonLdOrganization />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
