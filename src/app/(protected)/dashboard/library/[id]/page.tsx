import { redirect } from "next/navigation";
import { findLibraryById } from "@/data/library";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteLibrary from "../../_components/DeleteLibrary";

interface LibraryIDPageProps {
  params: {
    id: string;
  };
}

const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

const LibraryIDPage = async ({ params }: LibraryIDPageProps) => {
  if (!isValidObjectId(params.id)) {
    redirect("/library");
  }

  const library = await findLibraryById(params.id);
  if (!library) {
    redirect("/library");
  }
  return (
    <>
      <div className="flex flex-col">
        <div className="flex w-full justify-between">
          <Button variant="link">
            <Link href={"/library/" + library.id}>
              <h1 className="text-4xl font-bold lowercase">{library.name}</h1>
            </Link>
          </Button>
          <div className="flex gap-6">
            <DeleteLibrary id={library.id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LibraryIDPage;
