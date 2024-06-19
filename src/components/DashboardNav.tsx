import { AppWindow, Library, SquarePlus, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import MenuButton from "./DashboardButton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";

const menuList = [
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
  // {
  //   group: "Profile",
  //   items: [
  //     {
  //       link: "/profile",
  //       text: "Your profile",
  //       icon: <User size={20} />,
  //     },
  //   ],
  // },
];

const DashboardNav = () => {
  return (
    <div className="">
      <Sheet>
        <SheetTrigger className="bg-neutral-800 px-2 py-1 rounded-md font-medium hover:bg-neutral-600 hover:text-foreground/90">
          Dashboard
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dashboard Navigation</SheetTitle>
          </SheetHeader>
          {menuList.map((list: any, key: number) => (
            <div key={key}>
              <div key={key} className="flex flex-col gap-y-2 px-4 py-2">
                <span className="font-semibold text-xs text-gray-500">
                  {list.group}
                </span>
                {list.items.map((listItem: any, key: number) => (
                  <SheetClose asChild>
                    <Button type="submit" asChild variant="secondary">
                      <Link
                        className=" py-2 px-2 flex !justify-start gap-2 rounded-sm border-2 text-xs"
                        href={"/dashboard" + listItem.link}
                      >
                        {listItem.icon}
                        {listItem.text}
                      </Link>
                    </Button>
                  </SheetClose>
                ))}
              </div>
              <Separator />
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DashboardNav;
