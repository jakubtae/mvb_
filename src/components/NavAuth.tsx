"use client";
import Link from "next/link";
import SignOutButton from "./auth/SignOutButton";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";

const NavAuth = () => {
  const session = useSession();
  return (
    <div className="flex gap-4 items-center">
      {session.status == "authenticated" ? (
        <>
          <SignOutButton />
          <Button variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <Button variant="buy" asChild className="!font-base">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Sign up</Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default NavAuth;
