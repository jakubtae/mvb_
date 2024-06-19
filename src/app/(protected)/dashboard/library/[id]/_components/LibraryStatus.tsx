import { Button } from "@/components/ui/button";
import { db } from "@/lib/prismadb";
import { Badge } from "@/components/ui/badge";

interface SearchLibraryInterface {
  videosIds: string[];
}

interface SearchResult {
  status: "IN_PROCESS" | "FINISHED" | "NO_SUBS";
  title: string;
}

const LibraryStatus = async ({ videosIds }: SearchLibraryInterface) => {
  const videos = await Promise.all(
    videosIds.map(async (vidID) => {
      const video = await db.video.findFirst({
        where: { id: vidID },
        select: { status: true, title: true },
      });
      return video;
    })
  );

  const finishedVideosCount = videos
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .filter((video) => video.status === "FINISHED").length;
  const noSubsVideosCount = videos
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .filter((video) => video.status === "NO_SUBS").length;
  const noSubsWord = noSubsVideosCount > 1 ? "videos" : "video";
  const finishedVideosWord = finishedVideosCount > 1 ? "videos" : "video";
  return (
    <div className="flex flex-col md:flex-row w-full items-center gap-2">
      <div className="my-4 flex gap-4 w-full sm:w-1/2">
        <Badge className="flex-grow py-2" variant="outline">
          Finished {finishedVideosCount} /{" "}
          {videosIds.length - noSubsVideosCount} {finishedVideosWord}
        </Badge>
        <Badge className="flex-grow py-2" variant="destructive">
          No subtitles for {noSubsVideosCount} {noSubsWord}{" "}
        </Badge>
      </div>
      <span className="text-wrap">
        If your library is big you might have to wait and refresh for a few
        minutes
      </span>
    </div>
  );
};

export default LibraryStatus;
