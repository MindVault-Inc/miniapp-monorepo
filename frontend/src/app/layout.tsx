import { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { MiniKitProvider } from "@/providers/MiniKitProvider";
import NextAuthProvider from "@/providers/next-auth-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
      <body className={`${spaceGrotesk.variable} min-h-screen bg-background text-foreground antialiased`}>
        <NextAuthProvider>
        <MiniKitProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 min-h-screen bg-background">
                <SidebarInset className="p-4 md:p-6 h-full min-h-screen">
                  <div className="relative max-w-[1400px] mx-auto w-full h-full">
                    <SidebarTrigger 
                      className="absolute left-0 top-0 z-10 transition-all duration-200 ease-linear
                        !h-14 !w-14 md:!h-12 md:!w-12
                        md:absolute md:data-[state=expanded]:left-[calc(var(--sidebar-width)-3rem)] 
                        md:data-[state=collapsed]:left-0"
                      aria-label="Toggle Sidebar"
                    />
                    {children}
                  </div>
                </SidebarInset>
              </main>
            </div>
          </SidebarProvider>
        </MiniKitProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}