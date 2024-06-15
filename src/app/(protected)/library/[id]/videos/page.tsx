import { redirect } from "next/navigation";
import DeleteLibrary from "../../_components/DeleteLibrary";
import OpenSettings from "../../_components/OpenSettings";
import { findLibraryById, updateLibraryStatus } from "@/data/library";
import { Video } from "@prisma/client";
import YouTubeCard from "../../_components/YouTubeCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col my-2 rounded-xl border-gray-300 border-2 p-4">
      <div className="w-full flex items-center gap-x-2">
        <h2 className="text-lg font-bold">Library's Videos</h2>
        <h3 className="text-sm font-light	">({videos.length} videos)</h3>
      </div>
      {videos.length > 0 ? (
        <div className="grid grid-cols-auto-fit-minmax gap-2 mt-2 max-[740px]:flex max-[740px]:flex-col max-[740px]:items-center max-[740px]:justify-center">
          {videos.map((video: Video, index) => (
            <YouTubeCard video={video} key={index} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-2">No videos found.</p>
      )}
    </div>
  );
};

export default LibraryIDPage;
