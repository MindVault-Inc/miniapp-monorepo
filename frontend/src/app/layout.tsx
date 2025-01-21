import "@/app/globals.css";
import { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import dynamic from "next/dynamic";
import MiniKitProvider from "@/providers/MiniKitProvider";
import NextAuthProvider from "@/providers/next-auth-provider";
import LayoutContent from "@/components/LayoutContent";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const ErudaProvider = dynamic(
  () => import("@/providers/eruda-provider").then((mod) => ({ 
    default: ({ children }: { children: React.ReactNode }) => <mod.Eruda>{children}</mod.Eruda>
  })),
  { ssr: false }
);

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
      <body className={`${spaceGrotesk.variable} bg-neutral-bg text-foreground antialiased`}>
        <NextAuthProvider>
          <ErudaProvider>
            <MiniKitProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
            </MiniKitProvider>
          </ErudaProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}