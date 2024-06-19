"use client";

import Link from "next/link";
import { Button } from "./ui/button";
const MenuButton: React.FC<{ children: React.ReactNode; link: string }> = ({
  children,
  link,
}) => {
  return (
    <Link
      className=" py-2 px-2 w-30 flex justify-start gap-2 rounded-sm border-2 border-transparent hover:bg-secondary hover:border-gray-200 text-xs"
      href={"/dashboard" + link}
    >
      {children}
    </Link>
  );
};

export default MenuButton;
