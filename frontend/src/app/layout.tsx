import { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { MiniKitProvider } from "@/providers/MiniKitProvider";
import NextAuthProvider from "@/providers/next-auth-provider";
import MobileBottomNav from "@/components/BottomNav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "MiniKit Next.js Example",
  description: "Example application using MiniKit with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${spaceGrotesk.variable} min-h-screen bg-neutral-bg text-foreground antialiased overflow-x-hidden`}>
        <NextAuthProvider>
          <MiniKitProvider>
            <main className="min-h-screen w-full pb-16">
              {children}
            </main>
            <MobileBottomNav />
          </MiniKitProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}