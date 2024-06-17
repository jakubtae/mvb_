"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { searchLibrary } from "@/actions/searchLib"; // Replace with actual path
import Link from "next/link";
import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link2, SquareArrowOutUpRight } from "lucide-react";

interface SearchLibraryInterface {
  libraryid: string;
}

interface VideoEntry {
  start: string;
  dur: string;
  context: string;
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearchClick = () => {
    if (query.trim() !== "") {
      setSearchTriggered(true);
    }
  };

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-grow flex-col gap-2">
          <Label htmlFor="queryBox">Your search query</Label>
          <Input
            id="queryBox"
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Text you want to find"
          />
        </div>
        <Button type="button" onClick={handleSearchClick}>
          Search
        </Button>
      </div>

      {/* Display results */}
      <div className="mt-4">
        {loading && <p>Loading...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && results.length > 0 ? (
          results.map((video, index) => (
            <div key={index} className="mb-2">
              <Button variant="link" asChild>
                <Link
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-extrabold w-full flex items-center justify-between"
                >
                  {video.title}
                  <SquareArrowOutUpRight size={15} />
                </Link>
              </Button>
              <div className="w-[400px]">
                <AspectRatio ratio={16 / 9} asChild>
                  <Image
                    src={video.image}
                    alt={video.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </AspectRatio>
              </div>
              {video.entries.map((entry, entryIndex) => {
                console.log(entry.start);
                return (
                  <Link
                    key={entryIndex}
                    rel="noopener noreferrer"
                    className="flex w-full justify-between items-center"
                    href={
                      video.url + "&t=" + Math.floor(parseInt(entry.start) - 2)
                    }
                    target="_blank"
                  >
                    <p>{entry.context}</p>
                  </Link>
                );
              })}
            </div>
          ))
        ) : !loading && results.length === 0 && !error ? (
          <p>No results found</p>
        ) : null}
      </div>
    </div>
  );
};

export default SearchLibraryTool;
