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
    <div className="flex flex-col gap-2">
      <h1 className="text-xl md:text-2xl font-medium">{video.title}</h1>
      <YouTube
        videoId={video.videoId}
        title={video.title}
        className="w-full aspect-video"
        iframeClassName="w-full"
      />
    </div>
  );
};

export default VideoPage;
