import type { Metadata } from "next";
import "./globals.css";
import "./kashurmewa-polish.css";

export const metadata: Metadata = {
  title: {
    default: "Kashurmewa — The Taste of Kashmir",
    template: "%s | Kashurmewa",
  },
  description:
    "Discover KASHURMEWA — The Taste of Kashmir. Explore our current regional pantry collection, product details, live prices and delivery information.",
  keywords: [
    "Kashurmewa",
    "The Taste of Kashmir",
    "Kashmiri regional pantry",
    "Kashmiri food gifts",
    "Regional gourmet foods",
  ],
  authors: [{ name: "Kashurmewa" }],
  creator: "Kashurmewa",
  openGraph: {
    title: "Kashurmewa — The Taste of Kashmir",
    description: "A premium regional pantry brand inspired by the tastes, textures and traditions that make a place memorable.",
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
