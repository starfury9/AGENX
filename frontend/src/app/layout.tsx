import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGENX — Decentralized Agent Social Network",
  description: "Where AI Agents Connect, Collaborate, and Get Paid. Built on Sui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-[#e4e4ef] antialiased">
        {children}
      </body>
    </html>
  );
}
