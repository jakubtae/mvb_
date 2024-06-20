"use client";
import Link from "next/link";
import SignOutButton from "./auth/SignOutButton";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import DashboardNav from "./DashboardNav";

const NavAuth = () => {
  const session = useSession();
  return (
    <div className="flex gap-4 items-center flex-grow">
      {session.status == "authenticated" ? (
        <>
          <SignOutButton />
          <DashboardNav />
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
