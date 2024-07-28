"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCookies } from "next-client-cookies";
import { Button } from "./ui/button";
import { X } from "lucide-react";

const TopNav = () => {
  const pathname = usePathname();
  const cookies = useCookies();

  const OpenCookie = cookies.get("nav-close");
  if (OpenCookie === "true") {
    return null;
  }
  return (
    <div className="w-full p-2 bg-violet-500 text-sm font-semibold text-white text-center">
      {!pathname.match(/^\/dashboard(\/.*)?$/) ? (
        <div>
          <Link
            href="https://www.loom.com/share/e25da8ec58d24cf99e347e7691342157?sid=e52e0c9b-2952-4955-874f-e0ddde5662e4"
            target="_blank"
            className="hover:underline"
          >
            Welcome to medialibrary - a tool for easy research. Start here.
          </Link>
          <button
            onClick={() => {
              cookies.set("nav-close", "true");
            }}
            className="absolute right-0"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div>
          <Link href="loom link" className="hover:underline">
            Watch the tutorial
          </Link>
          <button
            onClick={() => {
              cookies.set("nav-close", "true", { expires: undefined });
            }}
            className="absolute right-0"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TopNav;
