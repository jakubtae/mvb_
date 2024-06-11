import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
// import { getServerSession } from "next-auth";
// import { options } from "@/app/api/auth/[...nextauth]/options";
async function Nav() {
  // const session = await getServerSession(options);
  const session = false;
  return (
    <div className="sticky top-0 z-10">
      <div className="flex flex-row justify-center py-1 bg-third">
        <p className="text-sm font-medium text-white">
          Welcome to TheBrains.com - a library of knowledge from YouTube
        </p>
      </div>
      <div className="flex gap-4 justify-between items-center px-20 border-b-2 border-b-gray-400 font-semibold bg-beige">
        <div className="flex">
          <div className="flex items-center gap-1 py-3 px-4 hover:border-b-black hover:border-b-2">
            <Image src="/brain.svg" width={25} height={25} />
            <Link href="/" className="font-bold">
              TheBrain.com
            </Link>
          </div>
          <div className="flex">
            <Link
              href="/search"
              className="py-3 px-4 box hover:border-b-black hover:border-b-2"
            >
              YouTube Search
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {session ? (
            <Link href="/auth/signout">
              <Button>Sign out</Button>
            </Link>
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
