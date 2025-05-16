import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { WalletConnectionProvider } from "../components/WalletConnectionProvider";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackAtom",
  description: "HackAtom Solana Tester",
};


export default function RootLayout() {
  return (
    <WalletConnectionProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 container py-5 px-8  mx-auto w-full max-w-[2400px]`}
        >
          <Header />
        </body>
      </html>
    </WalletConnectionProvider>
  );
}
