import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kashurmewa — The Taste of Kashmir",
    template: "%s | Kashurmewa",
  },
  description:
    "The Taste of Kashmir. Discover thoughtfully presented products rooted in place, crafted for everyday rituals and shared tables.r natural crunch and freshness.",
  keywords: [
    "Kashmiri walnuts",
    "Walnuts in shell",
    "Kashurmewa",
    "Kashmir dry fruits",
    "Organic walnuts India",
    "Buy walnuts online",
  ],
  authors: [{ name: "Kashurmewa" }],
  creator: "Kashurmewa",
  openGraph: {
    title: "Kashurmewa — Authentic Kashmiri In-Shell Walnuts",
    description: "Premium Kashmiri walnuts sourced directly from mountain orchards.",
    url: "https://kashurmewa.com",
    siteName: "Kashurmewa",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
