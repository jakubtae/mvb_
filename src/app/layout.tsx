import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "tailwindcss/tailwind.css";
import "./globals.css";
import Nav from "@/components/Nav";
import AuthProvider from "@/context/AuthProvider";
import BrandLogo from "@/components/main/BrandLogo";
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
      className={`scroll-smooth -scroll-pt-10 ${montserrat.className} text-black min-h-screen antialiased`}
    >
      <body className="bg-background min-h-screen">
        <AuthProvider>
          <Nav />
          {children}
          <footer className="bg-foreground text-background font-bold flex p-4 items-center">
            <BrandLogo variant="dark" />
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
