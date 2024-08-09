"use client";
import { useEffect, useState } from "react";
import fetchVideo from "./_actions/fetchVideo";
import type { Video } from "@prisma/client";
import YouTube, { YouTubeProps, YouTubeEvent } from "react-youtube";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
// import forceSubs from "./_actions/forceSubs";

interface VideoPageParams {
  params: {
    id: string;
  };
}

const VideoPage = ({ params }: VideoPageParams) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<null | string>(null);
  const { data: session, status } = useSession({ required: true });

  useEffect(() => {
    fetchVideo(params.id).then((data) => {
      if (data.success) {
        setVideo(data.success);
      }
      if (data.error) {
        setError(data.error);
      }
    });
  }, [params.id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!video) {
    return <div>Loading...</div>;
  }
  if (!session) {
    return "What";
  }

  return (
    <div className="flex flex-col gap-2 w-full items-start">
      <div className="flex flex-col gap-4 w-full border-2 border-neutral-700 rounded-lg pb-4">
        <YouTube
          videoId={video.videoId}
          title={video.title}
          iframeClassName="h-full w-full rounded-lg"
          className="aspect-video w-full rounded-lg"
        />
        <div className="flex flex-col md:flex-row gap-2 gap-y-4 justify-center md:justify-between items-start md:items-center px-4">
          <h1 className="text-sm md:text-base font-medium">{video.title}</h1>
          {video.subtitles.length > 0 ? (
            <Badge variant="default">YT subtitles</Badge>
          ) : (
            <Badge variant="destructive">No subtitles</Badge>
          )}
        </div>
      </div>
      {video.subtitles.length > 0 && (
        <>
          <h2 className="font-semibold text-lg">Subtitles</h2>
          <div id="subs" className="px-2">
            {video.subtitles
              .reduce<string[][]>((acc, subtitle, ind) => {
                if (ind % 14 === 0) acc.push([]);
                acc[acc.length - 1].push(subtitle.text);
                return acc;
              }, [])
              .map((group, groupInd) => (
                <div key={groupInd} className="py-1 font-medium">
                  {group.join(" ")}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPage;
