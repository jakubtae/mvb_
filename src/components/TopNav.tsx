"use client";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";

const TopNav = () => {
  const pathname = usePathname();
  return (
    <div className="w-full p-2 bg-violet-500 text-sm font-semibold text-white text-center">
      {pathname !== "/dashboard" ? (
        <Link href="/watch/video" className="hover:underline">
          Welcome to medialibrary - a tool for easy research. Start here.
        </Link>
      ) : (
        <Link href="loom link">Watch the tutorial</Link>
      )}
    </div>
  );
};

export default TopNav;
