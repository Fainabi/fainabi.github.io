import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNav } from "@/components/top-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

export const metadata: Metadata = {
  title: "faina — Blog",
  description:
    "A blog about programming, technology, deep learning, and mathematics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopNav />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
