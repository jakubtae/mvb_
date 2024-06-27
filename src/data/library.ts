import { cache } from "@/lib/cache";
import { db } from "@/lib/prismadb";
import { Library } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import Fuse from "fuse.js";

export const createNewLibrary = async (
  name: string,
  sources: string[],
  id: string,
  videoIds: string[],
  visibility: "PRIVATE" | "PUBLIC"
) => {
  try {
    const libExists = await db.library.findFirst({
      where: {
        userId: id,
        name,
      },
    });
    if (libExists) {
      return {
        error: "Library with such a name already exists. Use a unique name.",
      };
    }

    const newLib = await db.library.create({
      data: {
        name,
        sources,
        userId: id,
        videoIds, // Add the videoIds array here
        uniqueViews: [id],
        visibility: visibility,
      },
    });
    if (!newLib) {
      return { error: "Error creating a library" };
    }

    await Promise.all(
      videoIds.map((videoId) =>
        db.video.update({
          where: { id: videoId },
          data: {
            libraryIDs: {
              push: newLib.id,
            },
          },
        })
      )
    );
    revalidateTag("findUserLibraries");
    return { success: "Library created", id: newLib.id };
  } catch (error) {
    console.error("Failed to create a new library", error);
    throw new Error("Error creating a new library");
  }
};

export const deleteALibrary = async (id: string) => {
  try {
    const gotDeleted = await db.library.delete({
      where: {
        id,
      },
    });
    gotDeleted.videoIds.forEach(async (videoId) => {
      const checkVid = await db.video.findUnique({
        where: {
          id: videoId,
        },
      });
      const toPull = await db.video.update({
        where: {
          id: videoId,
        },
        data: {
          libraryIDs: {
            set: checkVid?.libraryIDs.filter((id) => id !== gotDeleted.id),
          },
        },
      });
      if (!toPull) {
        throw new Error(
          "Error pulling relate library.id from Video.librariesIds"
        );
      }
    });
    revalidatePath("/dashboard/libraries");
    revalidateTag("findUserLibraries");
    return gotDeleted;
  } catch (error) {
    console.error("Failed to delete a library", error);
    throw new Error("Error deleting a library from database");
  }
};

export const findrecentLibraries = async (user_id: string) => {
  try {
    const libraries = await db.library.findMany({
      where: {
        userId: user_id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
    });
    return libraries;
  } catch (error) {
    console.error("Failed to find user libraries", error);
    throw new Error("Error fetching libraries from database");
  }
};

export const findLibraryById = async (id: string) => {
  try {
    const library = await db.library.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        userId: true,
        visibility: true,
        uniqueViews: true,
        name: true,
        status: true,
        videoStatus: true,
        videoNumber: true,
        predictedDuration: true,
      },
    });
    return library;
  } catch (error) {
    console.error("Failed to find a library by ID", error);
    throw new Error("Error fetching library by ID from database");
  }
};

interface VideoEntry {
  start: string;
  dur: string;
  words: {
    text: string;
    type: "QUERY" | "CONTEXT";
  }[];
}

interface WordArray {
  text: string;
  type: "QUERY" | "CONTEXT";
}

interface VideoResult {
  id: string;
  image: string;
  title: string;
  url: string;
  entries: VideoEntry[];
}
interface Subtitle {
  start: string;
  dur: string;
  text: string;
  wordIndex: number;
  type: "QUERY" | "CONTEXT";
}
/**
 *
 * @param query A word/pharse you want to look for
 * @param libraryId Library ID
 * @param take how many libraries you want to search through
 * @param skip the library you start from
 * @returns an array of object of VideoResult type
 */

export const searchLibraryVideosBySubtitleWithContext = async (
  query: string,
  libraryId: string,
  take: number,
  skip: number
): Promise<VideoResult[]> => {
  try {
    // Split the query into individual words
    const queryWords = query.toLowerCase().trim().split(" ");

    // Fetch videos from the database that belong to the specified library
    const videos = await db.video.findMany({
      where: {
        libraryIDs: {
          has: libraryId,
        },
      },
      take: take,
      skip: skip,
    });

    // Process each video to add context around matched subtitles
    const videosWithContext: VideoResult[] = [];
    const gapWord = 3;
    const wordsAfter = 3;
    const wordsBefore = 3;
    for (const video of videos) {
      const entries: VideoEntry[] = [];

      for (let i = 0; i < video.subtitles.length; i++) {
        const subtitle = video.subtitles[i];

        // Check if the current subtitle matches the first query word
        if (subtitle.text === queryWords[0]) {
          let foundPhrasearr: Subtitle[] = [];
          let isMatch = true;

          // Build foundPhrasearr for the entire queryWords sequence
          for (let z = 0; z < queryWords.length; z++) {
            const currentIndex = i + z;

            if (currentIndex < video.subtitles.length) {
              // Check if current subtitle matches query word
              if (video.subtitles[currentIndex].text === queryWords[z]) {
                foundPhrasearr.push({
                  ...video.subtitles[currentIndex],
                  type: "QUERY",
                });
              } else {
                // Attempt to find gap words within gapWord range
                let foundGap = false;
                for (let gw = 1; gw <= gapWord; gw++) {
                  if (
                    currentIndex + gw < video.subtitles.length &&
                    video.subtitles[currentIndex + gw].text === queryWords[z]
                  ) {
                    // Push each gap word found
                    for (let g = 0; g < gw; g++) {
                      foundPhrasearr.push({
                        ...video.subtitles[currentIndex + g],
                        type: "CONTEXT",
                      });
                    }
                    foundPhrasearr.push({
                      ...video.subtitles[currentIndex + gw],
                      type: "QUERY",
                    });
                    foundGap = true;
                    break; // Exit the gap word search loop
                  }
                }
                if (!foundGap) {
                  isMatch = false;
                  break; // Exit the query word loop
                }
              }
            } else {
              isMatch = false;
              break; // Exit the query word loop
            }
          }

          if (isMatch) {
            // Collect previous subtitles as context
            const previousSubtitles: WordArray[] = [];
            for (let j = Math.max(0, i - wordsBefore); j < i; j++) {
              previousSubtitles.push({
                text: video.subtitles[j].text,
                type: "CONTEXT",
              });
            }

            // Collect next subtitles as context
            const nextSubtitles: WordArray[] = [];
            let nextStartIndex = i + queryWords.length;

            // If gap words were found, adjust nextStartIndex accordingly
            if (foundPhrasearr.length > queryWords.length) {
              nextStartIndex += foundPhrasearr.length - queryWords.length;
            }

            for (let j = nextStartIndex; j < nextStartIndex + wordsAfter; j++) {
              if (j < video.subtitles.length) {
                nextSubtitles.push({
                  text: video.subtitles[j].text,
                  type: "CONTEXT",
                });
              }
            }

            // Combine all parts into the final result
            const joinedWords: WordArray[] = [
              ...previousSubtitles,
              ...foundPhrasearr.map((sub) => ({
                text: sub.text,
                type: sub.type,
              })),
              ...nextSubtitles,
            ];

            const start = foundPhrasearr[0].start; // Assuming start exists in foundPhrasearr
            const totalDur = foundPhrasearr
              .reduce((acc, sub) => acc + parseFloat(sub.dur), 0)
              .toFixed(10);

            const result: VideoEntry = {
              words: joinedWords,
              start: start,
              dur: totalDur,
            };

            entries.push(result);
          }
        }
      }

      // Add video to results if entries exist
      if (entries.length > 0) {
        videosWithContext.push({
          id: video.id,
          image: video.thumbnailUrl,
          title: video.title,
          url: video.url,
          entries,
        });
      }
    }

    // Return the processed videos with subtitles context
    return videosWithContext;
  } catch (error) {
    console.error("Failed to search videos by subtitle with context", error);
    throw new Error(
      "Error searching videos by subtitle with context in the database"
    );
  }
};
