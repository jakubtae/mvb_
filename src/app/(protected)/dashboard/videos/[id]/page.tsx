"use client";
import { useEffect, useState } from "react";
import fetchVideo from "./_actions/fetchVideo";
import type { Video } from "@prisma/client";
import YouTube, { YouTubeProps, YouTubeEvent } from "react-youtube";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

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
      {video.subtitles.length > 0 ? (
        <Button variant="secondary">View subtitles</Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="subtleDestructive">Force Subtitles</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Force creating subtitles?</DialogHeader>
            <DialogDescription>
              Forcing this video will remove X tokens from your account. Are you
              sure you want to do it? ( YOU CANNOT UNDO IT )
            </DialogDescription>
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-between">
              <DialogClose asChild>
                <Button variant="destructive">Not now</Button>
              </DialogClose>
              <Button
                variant="buy"
                className="!font-medium"
                onClick={() => {
                  if (!session.user?.id) {
                    return console.log("User ID required");
                  }
                  console.log("Forced subs by " + session?.user.id);
                }}
              >
                Force subtitles
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VideoPage;
