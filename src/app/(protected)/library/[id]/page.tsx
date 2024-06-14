import { redirect } from "next/navigation";
import DeleteLibrary from "../_components/DeleteLibrary";
import OpenSettings from "../_components/OpenSettings";
import { findLibraryById, updateLibraryStatus } from "@/data/library";
import { Video } from "@prisma/client";
import YouTubeCard from "../_components/YouTubeCard";

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
  const videos = library.Videos;
  return (
    <div className="flex flex-col">
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-bold">{library.name}</h1>
        <div className="flex gap-6">
          <DeleteLibrary id={library.id} />
          <OpenSettings id={library.id} />
        </div>
      </div>
      <div className="flex flex-col gap-y-4 mt-10">
        {videos.map((video: Video, index) => (
          <YouTubeCard video={video} key={index} />
        ))}
      </div>
    </div>
  );
};

export default LibraryIDPage;
