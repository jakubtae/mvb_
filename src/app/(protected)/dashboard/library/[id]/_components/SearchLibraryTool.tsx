"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { searchLibrary } from "@/actions/searchLib"; // Replace with actual path
import Link from "next/link";
import YouTube, { YouTubeProps, YouTubeEvent } from "react-youtube";
import React from "react";

import { SquareArrowOutUpRight } from "lucide-react";
import { formatTime } from "@/lib/formatTime";

interface SearchLibraryInterface {
  libraryid: string;
  docsLimit: number;
}

interface VideoEntry {
  start: string;
  dur: string;
  words: {
    text: string;
    type: "QUERY" | "CONTEXT";
  }[];
}

function extractYouTubeVideoId(url: string): string {
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : "";
}

interface VideoResult {
  entries: VideoEntry[];
  image: string;
  title: string;
  url: string;
}

const SearchLibraryTool = ({
  libraryid,
  docsLimit,
}: SearchLibraryInterface) => {
  const [query, setQuery] = useState("");
  const [take, setTake] = useState(docsLimit);
  const [skip, setSkip] = useState(0);

  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const playerRefs = useRef<any[]>([]); // Array of refs for YouTube players
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        if (query.trim() !== "") {
          const searchResults = await searchLibrary(
            query,
            libraryid,
            take,
            skip
          );
          if (searchResults && searchResults.success) {
            setResults(searchResults.success);
          } else if (searchResults && searchResults.error) {
            setError(searchResults.error);
            setResults([]); // Clear previous results on error
          } else {
            setResults([]); // No results found case
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Error searching videos:", err);
        setError("An error occurred while searching videos.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchTriggered) {
      fetchSearchResults();
      setSearchTriggered(false); // Reset the trigger
    }
  }, [searchTriggered, libraryid, query, take, skip]);

  useEffect(() => {
    // Initialize refs for each video
    playerRefs.current = new Array(results.length);
  }, [results.length]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      setSearchTriggered(true);
      // Perform your desired action here
    }
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // const handleTakeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(event.target.value, 10);
  //   if (value > docsLimit) {
  //     setTake(docsLimit);
  //   } else if (value <= 0) {
  //     setTake(1); // Ensuring take is at least 1, assuming 1 is the minimum valid value
  //   } else {
  //     setTake(value);
  //   }
  // };

  // const handleSkipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(event.target.value, 10);
  //   if (value < 0) {
  //     setSkip(0); // Ensuring skip doesn't go below 0
  //   } else if (value + take > docsLimit) {
  //     setSkip(docsLimit - take); // Ensuring skip + take doesn't exceed total documents
  //   } else {
  //     setSkip(value);
  //   }
  // };

  const handleSearchClick = () => {
    if (query.trim() !== "") {
      setSearchTriggered(true);
    }
  };

  const handleButtonClick = (index: number, time: number) => {
    if (playerRefs.current[index]) {
      playerRefs.current[index].seekTo(time - 2);
    }
  };

  const handlePlayerReady = (index: number, event: any) => {
    playerRefs.current[index] = event.target;
  };

  return (
    <div className="flex flex-col gap-y-6 md:gap-y-10 w-full mt-4 relative">
      <div className="w-full flex flex-grow flex-col gap-2 gap-y-4 top-[100%]">
        <Label htmlFor="queryBox">Your search query</Label>
        <div className="flex items-end justify-between gap-4">
          <Input
            id="queryBox"
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Text you want to find"
            className="bg-background"
            disabled={loading}
          />
          <Button
            className="font-bold text-sm md:text-base h-full"
            type="button"
            onClick={handleSearchClick}
            disabled={loading}
          >
            Search
          </Button>
        </div>
        {/* <div className="flex gap-2 flex-col sm:flex-row gap-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="take">Number of documents to search</Label>
            <Input
              type="number"
              id="take"
              value={take}
              onChange={handleTakeChange}
              max={docsLimit}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="skip">Starting document</Label>
            <Input
              type="number"
              id="skip"
              value={skip}
              onChange={handleSkipChange}
              max={docsLimit}
              disabled={loading}
            />
          </div>
        </div> */}
        {!loading && results.length > 0 && (
          <>
            <p>
              Found {results.length} relevant sources and{" "}
              {results.reduce((acc, result) => acc + result.entries.length, 0)}{" "}
              results
            </p>
          </>
        )}
      </div>

      {/* Display results */}
      <div className="flex flex-col gap-4 w-full">
        {loading && (
          <p className="p-4 bg-slate-50 dark:bg-neutral-800 text-white shadow-md rounded-lg">
            Loading...
          </p>
        )}

        {!loading && error && (
          <p className="p-4 bg-red-200 dark:bg-destructive text-red-600 shadow-md rounded-lg">
            {error}
          </p>
        )}

        {!loading && results.length > 0
          ? results.map((video, index) => {
              const opts: YouTubeProps["opts"] = {
                playerVars: {
                  start: parseInt(video.entries[0].start) - 2,
                },
              };

              return (
                <div
                  key={index}
                  className="w-full mb-4 p-4 pt-8 md:pt-4 rounded-lg border border-gray-300 bg-background shadow-md dark:shadow-slate-100/20"
                >
                  <div className="w-full flex flex-col md:flex-row items-center justify-between">
                    <Button variant="link" asChild className="flex-grow">
                      <Link
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between text-wrap"
                      >
                        <h1 className="text-sm md:text-base font-semibold">
                          {video.title} <span>({video.entries.length})</span>
                        </h1>
                        <SquareArrowOutUpRight className="ml-2 w-8 md:w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row items-start mt-6 md:mt-8 w-full">
                    <YouTube
                      videoId={extractYouTubeVideoId(video.url)}
                      title={video.title}
                      opts={opts}
                      onReady={(event: YouTubeEvent) =>
                        handlePlayerReady(index, event)
                      }
                      iframeClassName="w-full "
                      className="w-full md:w-1/2 aspect-[2/1] md:aspect-video"
                      loading="lazy"
                    />
                    <div className="flex flex-col mt-4 gap-2 flex-1 md:ml-4 overflow-y-auto w-full md:mt-0">
                      <div className="w-full lg:max-h-[360px] overflow-y-auto space-y-4 snap-y snap-always lg:pr-4">
                        {video.entries.map((entry, entryIndex) => {
                          return (
                            <Button
                              key={entryIndex}
                              variant="outline"
                              className="snap-start w-full flex justify-between items-start p-2 !h-auto md:!py-0 gap-1"
                              onClick={() =>
                                handleButtonClick(index, parseInt(entry.start))
                              }
                            >
                              <span className="text-wrap py-4 text-left">
                                {entryIndex + 1}.{" "}
                                {entry.words.map((word, wordIndex) => (
                                  <React.Fragment key={wordIndex}>
                                    <span
                                      className={
                                        word.type === "QUERY"
                                          ? "font-semibold text-white"
                                          : ""
                                      }
                                    >
                                      {word.text}
                                    </span>{" "}
                                    {/* Add space after each word */}
                                  </React.Fragment>
                                ))}
                              </span>
                              <span className="py-4">
                                {formatTime(parseInt(entry.start))}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          : !loading &&
            results.length === 0 &&
            !error && (
              <p className="p-4 bg-gray-100 dark:bg-background/60 dark:border-2 dark:border-gray-300/10 shadow-md rounded-lg">
                No results found
              </p>
            )}
      </div>
    </div>
  );
};

export default SearchLibraryTool;
