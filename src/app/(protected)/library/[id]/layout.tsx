import { findLibraryById } from "@/data/library";
import { redirect } from "next/navigation";
import DeleteLibrary from "../_components/DeleteLibrary";
import OpenSettings from "../_components/OpenSettings";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LibIdlayou({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>) {
  const isValidObjectId = (id: string): boolean => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  };
  if (!isValidObjectId(params.id)) {
    redirect("/library");
  }

  const library = await findLibraryById(params.id);
  if (!library) {
    redirect("/library");
  }
  return (
    <div className="flex flex-col">
      <div className="flex w-full justify-between">
        <Button variant="link">
          <Link href={"/library/" + library.id}>
            <h1 className="text-4xl font-bold lowercase">{library.name}</h1>
          </Link>
        </Button>
        <div className="flex gap-6">
          <DeleteLibrary id={library.id} />
          <OpenSettings id={library.id} />
        </div>
      </div>
      {children}
    </div>
  );
}
