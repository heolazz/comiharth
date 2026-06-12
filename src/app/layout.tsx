import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "ComiHarth - Premium Cinematic Manga Reader",
  description: "Read your favorite manga, manhwa, and manhua with an immersive, high-performance dark cinematic user experience.",
  keywords: ["manga", "manhwa", "manhua", "webtoon", "reader", "mangafire", "comiharth", "anime", "reading"],
  authors: [{ name: "ComiHarth" }],
  openGraph: {
    title: "ComiHarth - Immersive Comic Reader",
    description: "Premium, dark-themed manga, manhwa, and manhua vertical scroll webtoon reader.",
    type: "website",
    siteName: "ComiHarth"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-accent-green/20 selection:text-accent-green">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
