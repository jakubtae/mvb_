"use client";
import { useEffect, useState } from "react";
import fetchVideo from "./_actions/fetchVideo";
import type { Video } from "@prisma/client";
import YouTube, { YouTubeProps, YouTubeEvent } from "react-youtube";

interface VideoPageParams {
  params: {
    id: string;
  };
}

const VideoPage = ({ params }: VideoPageParams) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<null | string>(null);

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

  return (
    <div className="flex flex-col gap-2 w-full items-center">
      <h1 className="text-xl md:text-2xl font-medium">{video.title}</h1>
      <YouTube
        videoId={video.videoId}
        title={video.title}
        iframeClassName="h-full w-full"
        className="aspect-video w-full md:w-4/5"
      />
    </div>
  );
};

export default VideoPage;
