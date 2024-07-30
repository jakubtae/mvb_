"use client";
import React, { useEffect, useState } from "react";
import DeleteLibrary from "../../../_components/DeleteLibrary";
import { getLibSources } from "../_actions/getLibSources";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import SourceDropdown from "./SourceDropdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  videoId: string;
}

const LibrarySettings = ({ libId }: LibrarySettingsTypes) => {
  const [sources, setSources] = useState<SourceType[] | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const result = await getLibSources(libId);
        if (result?.Videos) {
          console.log(result.Videos);
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

  const renderSources = (sources: SourceType[]) => {
    return sources.map(
      ({ id, url, thumbnailUrl, title, videoId }: SourceType) => (
        <div
          className="flex flex-col gap-4 overflow-hidden w-full max-w-[250px] rounded-lg"
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
              vidID={videoId}
              onDelete={handleDeleteSource}
            />
          </div>
        </div>
      )
    );
  };

  if (!sources) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-semibold">Sources</h2>
        {/* <h3 className="text-lg md:text-xl font-medium">Youtube</h3> */}
        <div className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-8">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="w-auto h-[100px] rounded-lg" />
          ))}
        </div>
        <DeleteLibrary id={libId} />
      </div>
    );
  }

  const finishedSources = sources.filter(
    (source) => source.status === "FINISHED"
  );
  const inProcessSources = sources.filter(
    (source) => source.status === "IN_PROCESS"
  );
  const noSubsSources = sources.filter((source) => source.status === "NO_SUBS");

  return (
    <>
      <h2 className="text-lg md:text-xl font-semibold">Sources</h2>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        {noSubsSources.length > 0 && (
          <AccordionItem value="item-1" className="flex flex-col gap-y-2">
            <AccordionTrigger className="text-lg font-medium">
              No Subtitles
            </AccordionTrigger>
            <AccordionContent className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-8">
              {renderSources(noSubsSources)}
            </AccordionContent>
          </AccordionItem>
        )}
        {finishedSources.length > 0 && (
          <AccordionItem value="item-2" className="flex flex-col gap-y-2">
            <AccordionTrigger className="text-lg font-medium">
              Finished
            </AccordionTrigger>
            <AccordionContent className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-8">
              {renderSources(finishedSources)}
            </AccordionContent>
          </AccordionItem>
        )}
        {inProcessSources.length > 0 && (
          <AccordionItem value="item-3" className="flex flex-col gap-y-2">
            <AccordionTrigger className="text-lg font-medium">
              In Process
            </AccordionTrigger>
            <AccordionContent className="grid w-full grid-cols-auto-fit-minmax gap-y-6 gap-x-8">
              {renderSources(inProcessSources)}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      <div className="mt-4 flex flex-col gap-4">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Settings</h2>
        <DeleteLibrary id={libId} />
      </div>
    </>
  );
};

export default LibrarySettings;
