import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacyBanner from "@/components/PrivacyBanner";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "EASY PDF_SA — Automated Letterhead & Footer",
  description: "Automatically apply letterheads and footers to your PDF documents instantly, directly in your browser.",
  keywords: "PDF, letterhead, auto-format",
  openGraph: {
    title: "EASY PDF_SA",
    description: "Automatic Letterhead Generator",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col gradient-bg">
        <AuthProvider>
          <Navbar />
          <PrivacyBanner />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
