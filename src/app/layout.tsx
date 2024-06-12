import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "tailwindcss/tailwind.css";
import "./globals.css";
import Nav from "@/components/Nav";
// import AuthProvider from "@/context/AuthProvider";
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TheBrain.com",
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
      className={`scroll-smooth scroll-pt-0 ${montserrat.className} text-black`}
    >
      <body className="bg-beige">
        {/* <AuthProvider> */}
        <Nav />
        {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
