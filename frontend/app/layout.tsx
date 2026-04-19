import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Roboto } from 'next/font/google'
import { Inter } from 'next/font/google'
 
// If loading a variable font, you don't need to specify the font weight
const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"  >
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
