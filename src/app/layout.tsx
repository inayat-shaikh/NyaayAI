import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Indian Legal Advice and Judicial Workflow Platform",
  description: "AI-powered Indian legal platform providing legal advice, FIR filing, case management, and judicial workflow automation for citizens, police, lawyers, and courts.",
  keywords: ["Indian Legal", "Legal Advice", "FIR", "Case Management", "Judicial Workflow", "AI Legal", "Constitution", "IPC", "CrPC"],
  authors: [{ name: "Legal Platform Team" }],
  openGraph: {
    title: "Indian Legal Platform",
    description: "AI-powered legal platform for Indian citizens and legal professionals",
    url: "https://legalplatform.example.com",
    siteName: "Indian Legal Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Legal Platform",
    description: "AI-powered legal platform for Indian citizens and legal professionals",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
