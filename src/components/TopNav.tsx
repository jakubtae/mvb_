"use client";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";

const TopNav = () => {
  const pathname = usePathname();
  return (
    <div className="w-full p-2 bg-violet-500 text-sm font-semibold text-white text-center">
      {pathname !== "/dashboard" ? (
        <Link
          href="https://www.loom.com/share/e25da8ec58d24cf99e347e7691342157?sid=e52e0c9b-2952-4955-874f-e0ddde5662e4"
          target="_blank"
          className="hover:underline"
        >
          Welcome to medialibrary - a tool for easy research. Start here.
        </Link>
      ) : (
        <Link href="loom link" className="hover:underline">
          Watch the tutorial
        </Link>
      )}
    </div>
  );
};

export default TopNav;
