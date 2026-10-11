import type { Metadata } from "next";
import "./globals.css";
import "./kashurmewa-polish.css";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  ...(configuredSiteUrl ? { metadataBase: new URL(configuredSiteUrl) } : {}),
  title: {
    default: "Kashurmewa | The Taste of Kashmir",
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
    title: "Kashurmewa | The Taste of Kashmir",
    description: "Discover Kashurmewa's collection with current pack sizes, catalogue prices and product details.",
    ...(configuredSiteUrl ? { url: configuredSiteUrl } : {}),
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
