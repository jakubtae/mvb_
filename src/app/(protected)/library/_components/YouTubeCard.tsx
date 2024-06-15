import { Video } from "@prisma/client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTime } from "@/lib/formatTime";

interface YouTubeCardProps {
  video: Video;
}

const YouTubeCard: React.FC<YouTubeCardProps> = ({ video }) => {
  const defineSize = video.thumbnails.length - 3;
  return (
    <div
      className="flex flex-col p-2 rounded-lg"
      style={{ width: video.thumbnails[defineSize].width + 20 }}
    >
      <div className="relative">
        <Image
          src={video.thumbnails[defineSize].url}
          width={video.thumbnails[defineSize].width}
          height={video.thumbnails[defineSize].height}
          alt={video.title}
          className="rounded-lg"
        />
        {video.duration && (
          <span className="absolute right-2 bottom-2 bg-black/80 text-white font-semibold text-xs z-2 p-1 rounded">
            {formatTime(video.duration)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-y-1 px-1 mt-2">
        <h4 className="line-clamp-2 w-full text-sm">{video.title}</h4>
        {/* TODO : IMPLEMENT A SETTINGS OPTION TO REMOVE THE VIDEO FROM LIBRARY */}
        <p className="text-xs font-light truncate">{video.channelName}</p>
      </div>
    </div>
  );
};

export default YouTubeCard;
