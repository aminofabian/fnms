import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Coming Soon | FnM's Mini Mart",
  description: "FnM's Mini Mart is coming online soon. Fresh groceries, everyday essentials, and more—all delivered to your door. Contact us at support@fmns.co.ke or 0721530181",
  keywords: ["grocery", "mini mart", "online shopping", "fresh produce", "delivery", "Kenya", "groceries", "essentials"],
  authors: [{ name: "FnM's Mini Mart" }],
  creator: "FnM's Mini Mart",
  publisher: "FnM's Mini Mart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fmns.co.ke"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Coming Soon | FnM's Mini Mart",
    description: "FnM's Mini Mart is coming online soon. Fresh groceries, everyday essentials, and more—all delivered to your door.",
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
    title: "Coming Soon | FnM's Mini Mart",
    description: "Fresh groceries, everyday essentials, and more—all delivered to your door.",
    images: ["/fnms.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FnM's Mini Mart",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
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
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
