import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "@/auth";
import SignOutButton from "./auth/SignOutButton";

async function Nav() {
  const session = await auth();
  return (
    <div className="sticky top-0 z-10">
      {!session && (
        <div className="flex flex-row justify-center py-1 bg-third">
          <p className="text-sm font-semibold text-white">
            Welcome to medialibrary - a tool for easy search across multiple
            sources
          </p>
        </div>
      )}
      <div className="flex gap-4 justify-between items-center px-20 py-2 font-semibold bg-white border-b-2 border-b-gray-200">
        {/* <Button variant="link" asChild> */}
        <Link href="/" className="lowercase">
          MediaLibrary
        </Link>
        {/* </Button> */}
        <div className="flex items-center">
          <Button variant="ghost" asChild>
            <Link href="/howitworks">How it works?</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>
        <div className="flex gap-4 items-center">
          {session ? (
            <>
              <SignOutButton />
              <Button variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
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
