import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KASHURMEWA — The Taste of Kashmir",
  description: "Premium Kashmiri walnuts, carefully sourced and thoughtfully packed.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
