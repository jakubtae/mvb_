"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { deleteSource } from "../_actions/deleteSource";
import { useRouter } from "next/navigation";

interface SourceDropdownSpecs {
  id: string;
  url: string;
  libId: string;
  onDelete: (id: string) => void;
}

const SourceDropdown = ({ id, url, libId, onDelete }: SourceDropdownSpecs) => {
  const router = useRouter();

  const onClickHandler = async (id: string, libId: string) => {
    try {
      const data = await deleteSource(id, libId);
      if (data.success) {
        onDelete(id);
      } else if (data.error) {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Failed to delete source:", error);
    }
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
        <DropdownMenuItem asChild>
          <Link
            href={url}
            target="_blank"
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
