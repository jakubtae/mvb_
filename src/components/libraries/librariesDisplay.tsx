import { Library } from "@prisma/client";
import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";
import { Earth, Lock } from "lucide-react";
import Link from "next/link";

interface LibraryCOntainerProps {
  libraries: Library[];
}

const LibraryContainer = ({ libraries }: LibraryCOntainerProps) => {
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-4 w-full">
      {libraries.map((library, key) => (
        <Link
          key={key}
          className="flex flex-col gap-2 px-6 py-2 md:px-4 flex-grow flex-shrink basis-0 bg-neutral-300 dark:bg-neutral-700 rounded hover:bg-neutral-400 hover:dark:bg-neutral-600"
          href={"/dashboard/library/" + library.id}
        >
          <div className="flex w-full justify-between items-center">
            <h4 className="truncate">{library.name}</h4>
            {library.visibility.toLowerCase() === "private" ? (
              <LockClosedIcon />
            ) : (
              <LockOpen2Icon />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default LibraryContainer;
