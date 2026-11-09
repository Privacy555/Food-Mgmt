import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FoodShare · Bengaluru Urban",
  description:
    "FoodShare — food redistribution network. Connect food businesses with verified NGOs in Bengaluru. Share surplus, coordinate pickups.",
  icons: {
    icon:
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#176a4b" stroke-width="2.2" stroke-linecap="round"><path d="M6 2v5a4 4 0 0 0 8 0V2"/><path d="M10 11v11"/></svg>'
      ),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-fs-bg text-fs-ink`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
