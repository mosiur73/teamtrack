import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamTrack — Smart Project & Task Collaboration",
  description: "Manage projects, tasks, and team collaboration efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
