import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "tailwindcss/tailwind.css";
import "./globals.css";
import Nav from "@/components/Nav";
import AuthProvider from "@/context/AuthProvider";
import BrandLogo from "@/components/main/BrandLogo";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import { CookiesProvider } from "next-client-cookies/server";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans " });

export const metadata: Metadata = {
  title: "mediaLibrary",
  description: "Utilize knowledge with simple yet effective tools",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth -scroll-pt-10 ${montserrat.className} text-black min-h-screen antialiased dark`}
    >
      <body className="bg-background min-h-screen">
        <CookiesProvider>
          <AuthProvider>
            <div className="bg-background min-h-screen flex flex-col">
              <Nav />
              <div className="flex-grow">{children}</div>
              <Toaster />
              <footer className="bg-background text-background font-bold flex p-4 items-center border-t-2 border-t-foreground">
                <BrandLogo variant="dark" />
              </footer>
              <Analytics />
            </div>
          </AuthProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
