import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Roboto, Lexend } from "next/font/google";
import { Inter } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight

import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/sections/menu/Navbar";

const lexend = Lexend({
  weight: ["200", "400"],
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lexend.className} suppressHydrationWarning>
        <AuthProvider>
          <NextTopLoader color="#0E7BC3" showSpinner={true} />

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
