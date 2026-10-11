import type { Metadata } from "next";
import "./globals.css";
import "./kashurmewa-polish.css";

export const metadata: Metadata = {
  title: {
    default: "Kashurmewa — The Taste of Kashmir",
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
