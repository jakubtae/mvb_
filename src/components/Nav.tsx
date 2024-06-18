"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Library } from "lucide-react";
import TopNav from "./TopNav";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import NavAuth from "./NavAuth";
import { Separator } from "@/components/ui/separator";
import BrandLogo from "./main/BrandLogo";

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sticky top-0 z-10 bg-white">
      <TopNav />
      <div className="flex gap-4 justify-between items-center px-4 py-2 font-semibold border-b-2 border-b-gray-200 bg-background">
        <div className="w-full flex items-center justify-between">
          <BrandLogo variant="light" />
          <Button
            variant="ghost"
            onClick={toggleMenu}
            className="md:hidden mr-2"
          >
            <HamburgerMenuIcon />
          </Button>
        </div>
        <nav
          className={`md:flex md:gap-4 md:flex-row md:relative md:top-0 bg-background dark:bg-background ${
            isMenuOpen
              ? "absolute top-[80px] left-0 bg-white flex flex-col w-screen items-center gap-2 border-b-2 border-b-gray-300 py-2 md:border-none"
              : "hidden"
          }`}
        >
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/#howitworks" scroll={true}>
              How it works?
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/#testimonials" scroll={true}>
              Testimonials
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/#pricing" scroll={true}>
              Pricing
            </Link>
          </Button>
          <NavAuth />
        </nav>
      </div>
    </div>
  );
}

export default Nav;
