import type { Metadata } from "next";
import "./globals.css";
import "./kashurmewa-polish.css";

export const metadata: Metadata = {
  title: {
    default: "Kashurmewa — Premium Kashmiri Walnuts & Dry Fruits",
    template: "%s | Kashurmewa",
  },
  description:
    "Explore Kashurmewa Kashmiri walnuts in shell. Compare available pack sizes, current prices and delivery details before ordering.",
  keywords: [
    "Kashmiri walnuts",
    "Walnuts in shell",
    "Kashurmewa",
    "Kashmir dry fruits",
    "Buy walnuts online",
  ],
  authors: [{ name: "Kashurmewa" }],
  creator: "Kashurmewa",
  openGraph: {
    title: "Kashurmewa — Authentic Kashmiri In-Shell Walnuts",
    description: "Kashmiri walnuts in shell, with clear pack sizes and current catalogue prices.",
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
