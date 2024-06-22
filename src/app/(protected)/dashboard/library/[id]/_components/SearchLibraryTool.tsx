"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { searchLibrary } from "@/actions/searchLib"; // Replace with actual path
import Link from "next/link";
import YouTube, { YouTubeProps, YouTubeEvent } from "react-youtube";

import { SquareArrowOutUpRight } from "lucide-react";
import { formatTime } from "@/lib/formatTime";

interface SearchLibraryInterface {
  libraryid: string;
}

interface VideoEntry {
  start: string;
  dur: string;
  word: string;
  phrase: string;
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

const SearchLibraryTool = ({ libraryid }: SearchLibraryInterface) => {
  const [query, setQuery] = useState("");
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
          const searchResults = await searchLibrary(query, libraryid);
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
  }, [searchTriggered, libraryid, query]);

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
    <div className="flex flex-col gap-y-10 w-full mt-4">
      <div className="w-full flex flex-grow flex-col gap-2">
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
                          {video.title}
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
                      className="w-full md:w-1/2 aspect-video	"
                    />
                    <div className="flex flex-col mt-4 gap-2 flex-1 md:ml-4 overflow-y-auto w-full md:mt-0">
                      <div className="w-full lg:max-h-[360px] overflow-y-auto space-y-4 snap-y snap-always pr-4">
                        {video.entries.map((entry, entryIndex) => {
                          const startIndex = entry.phrase.indexOf(entry.word);
                          const endIndex = startIndex + entry.word.length;

                          // Split the phrase into three parts
                          const beforeWord = entry.phrase.substring(
                            0,
                            startIndex
                          );
                          const afterWord = entry.phrase.substring(endIndex);
                          return (
                            <Button
                              key={entryIndex}
                              variant="outline"
                              className="snap-start w-full flex items-center justify-between p-2"
                              onClick={() =>
                                handleButtonClick(index, parseInt(entry.start))
                              }
                            >
                              <span className="truncate">
                                {entryIndex + 1}.{" "}
                                <span className="font-medium">
                                  {beforeWord}
                                </span>
                                <span className="font-semibold text-white">
                                  {entry.word}
                                </span>
                                <span className="font-medium">{afterWord}</span>
                              </span>
                              {/* <span className="truncate">{entry.phrase}</span> */}
                              <span>{formatTime(parseInt(entry.start))}</span>
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
