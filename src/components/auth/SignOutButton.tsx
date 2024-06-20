"use client";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

const SignOutButton = () => {
  return (
    <Button onClick={() => signOut()} variant="link" className="flex-grow">
      Sign out
    </Button>
  );
};

export default SignOutButton;
