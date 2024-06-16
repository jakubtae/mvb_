// Import necessary components and functions
"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchLibrary } from "@/actions/searchLib"; // Replace with actual path
interface SearchLibraryInterface {
  libraryid: string;
}
const SearchLibraryTool = ({ libraryid }: SearchLibraryInterface) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]); // Define the type of your results accordingly
  const [loading, setLoading] = useState(false); // Loading state to indicate when a search is in progress

  useEffect(() => {
    // Function to fetch search results when query changes
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        if (query.trim() !== "") {
          // Only proceed if query is not empty
          const searchResults = await searchLibrary(libraryid, query);
          if (searchResults.error || !searchResults.success) {
            return false;
          }
          setResults(searchResults.success);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error searching videos:", error);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    };

    // Call fetchSearchResults function when query changes
    fetchSearchResults();
  }, [libraryid, query]); // Dependencies: libraryid and query

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
  };

  return (
    <div className="flex flex-col">
      <Label htmlFor="queryBox">Your search query</Label>
      <Input
        id="queryBox"
        type="text"
        value={query}
        onChange={handleInputChange}
      />

      {/* Display results */}
      <div className="mt-4">
        {loading && <p>Loading...</p>}
        {!loading && results.length > 0 ? (
          results.map((video) => (
            <div key={video.videoId} className="mb-2">
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              {/* Render subtitles with context */}
              {video.entries.map((entry: any, index: number) => (
                <div key={index}>
                  <p>{entry.context}</p>
                </div>
              ))}
            </div>
          ))
        ) : !loading && results.length === 0 ? (
          <p>No results found</p>
        ) : null}
      </div>
    </div>
  );
};

export default SearchLibraryTool;
