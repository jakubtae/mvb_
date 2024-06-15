import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "@/auth";
import SignOutButton from "./auth/SignOutButton";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

async function Nav() {
  const session = await auth();
  return (
    <div className="sticky top-0 z-10">
      {!session && (
        <div className="flex flex-row justify-center py-1 bg-third">
          <p className="text-sm font-medium text-white">
            Welcome to TheBrains.com - a library of knowledge from YouTube
          </p>
        </div>
      )}
      <div className="flex gap-4 justify-between items-center px-20 border-b-2 border-b-gray-400 font-semibold bg-white">
        <div className="flex">
          <div className="flex items-center gap-1 py-3 px-4 hover:border-b-black hover:border-b-2">
            <Image src="/brain.svg" width={25} height={25} alt="BL" />
            <Link href="/" className="font-bold">
              TheBrain
            </Link>
          </div>
          <div className="flex">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="py-3 px-4 box hover:border-b-black hover:border-b-2"
                >
                  Dashboard
                </Link>
                <Link
                  href="/library"
                  className="py-3 px-4 box hover:border-b-black hover:border-b-2"
                >
                  Libraries
                </Link>
              </>
            ) : (
              <Link
                href="/search"
                className="py-3 px-4 box hover:border-b-black hover:border-b-2"
              >
                YouTube Search
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {session &&
          session.user &&
          session.user.image &&
          session.user.name ? (
            <>
              <SignOutButton />
              <Avatar>
                <AvatarImage src={session.user.image} alt={session.user.name} />
                <AvatarFallback>
                  {session.user.name
                    .split(" ")
                    .map((word) => word[0].toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="link" className="text-base">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="text-base">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Nav;
