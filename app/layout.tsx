import type { Metadata } from "next";
import "./globals.css";
import "./kashurmewa-polish.css";

export const metadata: Metadata = {
  title: {
    default: "Kashurmewa — Premium Kashmiri Walnuts & Dry Fruits",
    template: "%s | Kashurmewa",
  },
  description:
    "Handpicked premium Kashmiri walnuts in natural shell. Sourced directly from high-altitude mountain orchards of Kashmir and packed for natural crunch and freshness.",
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
