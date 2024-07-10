"use client";
import React, { useEffect, useState } from "react";
import DeleteLibrary from "../../../_components/DeleteLibrary";
import { getLibSources } from "../_actions/getLibSources";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { SquareArrowOutUpRight } from "lucide-react";
import SourceDropdown from "./SourceDropdown";

interface LibrarySettingsTypes {
  libId: string;
}

interface SourceType {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  status: string;
}

const LibrarySettings = ({ libId }: LibrarySettingsTypes) => {
  const [sources, setSources] = useState<any>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const result = await getLibSources(libId);
        setSources(result?.Videos);
      } catch (error) {
        console.error("Error fetching library sources:", error);
      }
    };

    fetchSources();
  }, [libId]);

  return (
    <div className="flex flex-col gap-2">
      Library settings
      <h2 className="text-xl md:text-2xl font-bold">Sources</h2>
      <h3 className="text-lg md:text-xl font-semibold">Youtube</h3>
      <div className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-8">
        {sources ? (
          sources.map(({ id, url, thumbnailUrl, title }: SourceType) => {
            return (
              <div
                className="flex flex-col gap-4 overflow-hidden w-full"
                key={id}
              >
                <AspectRatio ratio={16 / 9} className="rounded-lg">
                  <Image
                    src={thumbnailUrl}
                    fill
                    alt={title}
                    className="object-cover rounded-lg transition-transform hover:scale-[1.01]"
                  />
                </AspectRatio>
                <div className="flex w-full justify-between gap-2">
                  <span className="text-sm w-full flex-grow line-clamp-2">
                    {title}
                  </span>
                  <SourceDropdown
                    id={id}
                    title={title}
                    url={url}
                    libId={libId}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <>
            <Skeleton className="w-auto h-[100px] rounded-lg" />
            <Skeleton className="w-auto h-[100px] rounded-lg" />
            <Skeleton className="w-auto h-[100px] rounded-lg" />
            <Skeleton className="w-auto h-[100px] rounded-lg" />
            <Skeleton className="w-auto h-[100px] rounded-lg" />
          </>
        )}
      </div>
      <DeleteLibrary id={libId} />
    </div>
  );
};

export default LibrarySettings;
