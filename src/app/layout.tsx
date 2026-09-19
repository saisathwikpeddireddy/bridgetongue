import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Bridgetongue — you already speak more than you think",
  description:
    "Language learning by transfer. Instead of starting you at zero, Bridgetongue maps the language you already know onto the one you want.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
