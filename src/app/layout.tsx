import { Lora, Outfit } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const display = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Roots & Relations — Family Tree",
  description:
    "Build, visualize, and preserve your family genealogy with an interactive tree, stories, photos, and historical records.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
