"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  MoreVertical,
  SquareArrowOutUpRight,
} from "lucide-react";
import Link from "next/link";
import { deleteSource } from "../_actions/deleteSource";
import { useRouter } from "next/navigation";

interface SourceDropdownSpecs {
  id: string;
  title: string;
  url: string;
  libId: string;
}
const SourceDropdown = ({ id, title, url, libId }: SourceDropdownSpecs) => {
  const router = useRouter();
  const onClickHandler = (id: string, libId: string) => {
    deleteSource(id, libId).then((data) => {
      if (data.success) {
        console.log("Removed the source");
        // TODO: fix this refresh - currently doesn't refresh at all
        router.refresh();
      }
      if (data.error) {
        console.error(data.error);
      }
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="gap-2">
        <DropdownMenuItem asChild>
          <Button
            variant="destructive"
            onClick={() => onClickHandler(id, libId)}
            className="w-full"
          >
            Delete source
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href={url}
            target="blank"
            className="flex w-full justify-around items-center"
          >
            Open in YT
            <SquareArrowOutUpRight size={12} />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SourceDropdown;
