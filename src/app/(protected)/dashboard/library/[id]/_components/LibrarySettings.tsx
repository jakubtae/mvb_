"use client";
import React, { useEffect, useState } from "react";
import DeleteLibrary from "../../../_components/DeleteLibrary";
import { getLibSources } from "../_actions/getLibSources";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import SourceDropdown from "./SourceDropdown";

interface LibrarySettingsTypes {
  libId: string;
}

interface SourceType {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  author: {
    name: string;
    url: string;
  };
  status: string;
}

const LibrarySettings = ({ libId }: LibrarySettingsTypes) => {
  const [sources, setSources] = useState<SourceType[] | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const result = await getLibSources(libId);
        if (result?.Videos) {
          setSources(result.Videos);
        } else {
          setSources([]);
        }
      } catch (error) {
        console.error("Error fetching library sources:", error);
      }
    };

    fetchSources();
  }, [libId]);

  const handleDeleteSource = (deletedId: string) => {
    setSources(
      (prevSources) =>
        prevSources?.filter((source) => source.id !== deletedId) || null
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl md:text-2xl font-bold">Sources</h2>
      <h3 className="text-lg md:text-xl font-semibold">Youtube</h3>
      <div className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-8">
        {sources
          ? sources.map(({ id, url, thumbnailUrl, title }: SourceType) => (
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
                    url={url}
                    libId={libId}
                    onDelete={handleDeleteSource}
                  />
                </div>
              </div>
            ))
          : Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="w-auto h-[100px] rounded-lg" />
            ))}
      </div>
      <DeleteLibrary id={libId} />
    </div>
  );
};

export default LibrarySettings;
