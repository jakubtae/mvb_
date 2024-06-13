import { findLibraryById } from "@/data/library";
import { redirect } from "next/navigation";
import DeleteLibrary from "../_components/DeleteLibrary";
import OpenSettings from "../_components/OpenSettings";

interface LibraryIDPageProps {
  params: {
    id: string;
  };
}

const isValidObjectId = (id: string): boolean => {
  // Regular expression to match MongoDB ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  // Check if the provided id matches the ObjectId pattern
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
    <div className="flex flex-col">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-bold">{library.name}</h1>
        <div className="flex gap-6">
          <DeleteLibrary id={library.id} />
          <OpenSettings id={library.id} />
        </div>
      </div>
      {JSON.stringify(library)}
    </div>
  );
};

export default LibraryIDPage;
