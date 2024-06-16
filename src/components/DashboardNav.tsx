import Link from "next/link";
import { Library, SquarePlus, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import MenuButton from "./DashboardButton";

const menuList = [
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
  {
    group: "Profile",
    items: [
      {
        link: "/profile",
        text: "Your profile",
        icon: <User size={20} />,
      },
    ],
  },
];

const DashboardNav = () => {
  return (
    <div className="flex flex-col items-start bg-light border-r-2 border-r-gray-200 py-10 gap-y-2">
      {menuList.map((list: any, key: number) => (
        <div key={key}>
          <div key={key} className="flex flex-col gap-y-2 px-4 py-2">
            <span className="font-semibold text-xs text-gray-500">
              {list.group}
            </span>
            {list.items.map((listItem: any, key: number) => (
              <MenuButton key={key} link={listItem.link}>
                {listItem.icon}
                {listItem.text}
              </MenuButton>
            ))}
          </div>
          <Separator />
        </div>
      ))}
    </div>
  );
};

export default DashboardNav;
