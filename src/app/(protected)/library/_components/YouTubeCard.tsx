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

interface YouTubeCardProps {
  video: Video;
}

const YouTubeCard: React.FC<YouTubeCardProps> = ({ video }) => {
  return (
    <Card className="flex">
      <CardHeader>
        <Image
          src={video.thumbnails[video.thumbnails.length - 1].url}
          width={video.thumbnails[video.thumbnails.length - 1].width}
          height={video.thumbnails[video.thumbnails.length - 1].height}
          alt={video.title}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        <CardTitle>{video.title}</CardTitle>
        <CardFooter>{video.channelName}</CardFooter>
      </CardContent>
    </Card>
  );
};

export default YouTubeCard;
