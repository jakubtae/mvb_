import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import Image from "next/image"; // Assuming you are using Next.js
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface CustomCardProps {
  src: string;
  alt: string;
  title: string;
  description: string;
}

const MainCard: React.FC<CustomCardProps> = ({
  src,
  alt,
  title,
  description,
}) => {
  return (
    <Card className="w-full md:w-1/2 pt-2 px-2 shadow-2xl shadow-purple-500/10 flex-grow bg-background text-foreground">
      <div className="w-full">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={src}
            alt={alt}
            fill
            className="rounded-lg object-cover border-2 border-gray-100"
          />
        </AspectRatio>
      </div>
      <CardHeader>
        <CardTitle className="font-bold text-lg md:text-base lg:text-lg">
          {title}
        </CardTitle>
        <CardDescription className="text-base md:text-sm lg:text-base">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default MainCard;
