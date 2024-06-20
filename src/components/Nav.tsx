import Link from "next/link";
import { Button } from "./ui/button";
import TopNav from "./TopNav";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import BrandLogo from "./main/BrandLogo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { auth } from "@/auth";
import { AppWindow, Library, SquarePlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SignOutButton from "./auth/SignOutButton";
interface MenuItem {
  link: string;
  text: string;
  icon: any;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

const menuList: MenuGroup[] = [
  {
    group: "Dashboard",
    items: [
      {
        link: "/",
        text: "Dashboard",
        icon: <AppWindow size={20} />,
      },
    ],
  },
  {
    group: "Libraries",
    items: [
      {
        link: "/libraries",
        text: "Your Libraries",
        icon: <Library size={20} />,
      },
      {
        link: "/library/create",
        text: "New Library",
        icon: <SquarePlus size={20} />,
      },
    ],
  },
];

async function Nav() {
  const session = await auth();
  return (
    <div className="sticky top-0 z-10 bg-white">
      <TopNav />
      <div className="flex gap-4 justify-between items-center px-4 py-2 font-semibold border-b-2 border-b-gray-200 bg-background">
        <div className="w-full flex items-center justify-between">
          <BrandLogo variant="light" />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden mr-2">
              <HamburgerMenuIcon />
            </Button>
          </SheetTrigger>
          <nav className="hidden md:flex md:gap-4 md:flex-row md:relative md:top-0 bg-background dark:bg-background">
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/#howitworks" scroll={true}>
                How it works?
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/#testimonials" scroll={true}>
                Testimonials
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/#pricing" scroll={true}>
                Pricing
              </Link>
            </Button>
            <div className="flex gap-4 items-center flex-grow">
              {!session?.user.role ? (
                <>
                  <Button variant="buy" asChild className="!font-base">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="!font-base flex-grow !py-5 !font-bold"
                  >
                    <Link href="/auth/register">Sign up</Link>
                  </Button>
                </>
              ) : (
                <SheetTrigger className="bg-neutral-200 dark:bg-neutral-800 px-2 py-2 rounded-md font-medium dark:hover:bg-neutral-600 dark:hover:text-foreground/90 hover:bg-neutral-300 hover:text-foreground/90 text-sm">
                  Dashboard
                </SheetTrigger>
              )}
            </div>
          </nav>
          <SheetContent className="bg-background dark:bg-background flex flex-col">
            {!session?.user.role ? (
              <>
                {" "}
                <SheetHeader>
                  <SheetTitle>Page Navigation</SheetTitle>
                </SheetHeader>
                <SheetClose asChild>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/#howitworks" scroll={true}>
                      How it works?
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/#testimonials" scroll={true}>
                      Testimonials
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/#pricing" scroll={true}>
                      Pricing
                    </Link>
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                {" "}
                <SheetHeader>
                  <SheetTitle>Dashboard Navigation</SheetTitle>
                </SheetHeader>
                {menuList.map((list, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="flex flex-col gap-y-2 px-4 py-2 mb-2">
                      <span className="font-semibold text-xs text-gray-500">
                        {list.group}
                      </span>
                      {list.items.map((listItem, itemIndex) => (
                        <SheetClose asChild key={itemIndex}>
                          <Link
                            className="py-2 px-2 flex !justify-start items-center gap-2 rounded-sm border-2 text-xs"
                            href={"/dashboard" + listItem.link}
                          >
                            {listItem.icon}
                            {listItem.text}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
                {session.user.role === "ADMIN" && (
                  <div className="flex flex-col gap-y-2 px-4 py-2">
                    <span className="font-semibold text-xs text-gray-500">
                      Admin
                    </span>
                    <SheetClose asChild>
                      <Link
                        className="py-2 px-2 flex !justify-start items-center gap-2 rounded-sm border-2 text-xs"
                        href={"/adminPanel"}
                      >
                        Admin Panel
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-4 items-center w-full mt-2">
              {session ? (
                <SignOutButton />
              ) : (
                <>
                  <SheetClose asChild>
                    <Button
                      variant="buy"
                      asChild
                      className="!font-base flex-grow"
                    >
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      asChild
                      className="!font-base flex-grow !py-5 !font-bold"
                    >
                      <Link href="/auth/register">Sign up</Link>
                    </Button>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default Nav;
