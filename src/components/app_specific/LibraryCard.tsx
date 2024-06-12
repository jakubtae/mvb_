import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LibraryCardProps {
  libraryName: string;
  videosNumber: number; // Make videosNumber optional since it might not always be provided
}

const LibraryCard = ({ libraryName, videosNumber }: LibraryCardProps) => {
  return (
    <Card className="w-[400px] hover:border-1 hover:border-primary">
      <CardHeader>
        <CardTitle>{libraryName}</CardTitle>
        <CardDescription>
          {videosNumber !== undefined
            ? videosNumber === 1
              ? `${videosNumber} video`
              : `${videosNumber} videos`
            : "0 videos"}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default LibraryCard;
