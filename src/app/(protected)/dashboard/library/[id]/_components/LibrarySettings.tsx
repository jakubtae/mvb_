"use client";
import React, { useEffect, useState } from "react";
import DeleteLibrary from "../../../_components/DeleteLibrary";
import { getLibSources } from "../_actions/getLibSources";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface LibrarySettingsTypes {
  id: string;
}

interface SourceType {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  status: string;
}

const LibrarySettings = ({ id }: LibrarySettingsTypes) => {
  const [sources, setSources] = useState<any>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const result = await getLibSources(id);
        setSources(result?.Videos);
      } catch (error) {
        console.error("Error fetching library sources:", error);
      }
    };

    fetchSources();
  }, [id]);

  return (
    <div className="flex flex-col gap-2">
      Library settings
      <h2 className="text-xl md:text-2xl font-bold">Sources</h2>
      <h3 className="text-lg md:text-xl font-semibold">Youtube</h3>
      <div className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-2">
        {sources ? (
          sources.map(({ id, url, thumbnailUrl, title }: SourceType) => {
            return (
              <Link href={url} target="blank" key={id}>
                <AspectRatio ratio={16 / 9} className="rounded-lg">
                  <Image
                    src={thumbnailUrl}
                    fill
                    alt={title}
                    className="object-cover rounded-lg transition-transform hover:scale-[1.01]"
                  />
                </AspectRatio>
              </Link>
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
      <DeleteLibrary id={id} />
    </div>
  );
};

export default LibrarySettings;
