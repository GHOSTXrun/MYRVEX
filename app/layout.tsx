import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MYRVEX — The living colony",
  description: "A shared ant colony, live market signals, and a transparent expedition ledger.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/formix-logo.jpg",
    shortcut: "/formix-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
