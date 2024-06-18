import { db } from "@/lib/prismadb";
import { Subtitles } from "lucide-react";

export const findUserLibraries = async (userId: string) => {
  try {
    const libraries = await db.library.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    if (!libraries) {
      throw new Error("Error finding user libraries");
    }
    return libraries;
  } catch (error) {
    console.error("Failed to find user libraries", error);
    throw new Error("Error fetching libraries from database");
  }
};

export const createNewLibrary = async (
  name: string,
  sources: string,
  id: string,
  videoIds: string[]
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
      include: {
        Videos: true, // Include all fields of Video
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
  word: string;
  phrase: string;
}

interface VideoResult {
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
}
type Entry = {
  start: string;
  dur: string;
  word: string;
  phrase: string;
};

function findAdjacentSubtitles(subtitles: Subtitle[]) {
  const entries: Entry[] = [];

  for (let i = 0; i < subtitles.length - 1; i++) {
    const subtitle1 = subtitles[i];
    const subtitle2 = subtitles[i + 1];

    // Check if the subtitles are adjacent based on wordIndex
    if (subtitle2.wordIndex === subtitle1.wordIndex + 1) {
      const matchedWords = [subtitle1.text, subtitle2.text];
      const totalDur = +subtitle1.dur + +subtitle2.dur; // Convert string to number and sum durations

      entries.push({
        start: subtitle1.start,
        dur: totalDur.toString(), // Convert total duration back to string
        word: matchedWords.join(" "),
        phrase: "your query", // Replace with actual query
      });
      return true;
    }
  }
}

export const searchLibraryVideosBySubtitleWithContext = async (
  query: string,
  libraryId: string
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
    });

    // Process each video to add context around matched subtitles
    const videosWithContext: VideoResult[] = videos
      .map((video) => {
        const entries: VideoEntry[] = [];
        const subs = video.subtitles;
        // Process subtitles to find and add context around matched query words
        console.log(video.id);
        const foundSubs: Subtitle[] = [];
        queryWords.map((queryWord) => {
          subs.forEach((subtitle) => {
            const match = queryWord === subtitle.text;
            if (!match) return null;
            if (queryWords.length == 1) {
              return entries.push({
                start: subtitle.start,
                dur: subtitle.dur,
                word: subtitle.text,
                phrase: query,
              });
            } else if (queryWords.length > 1) {
              foundSubs.push(subtitle);
              // TODO check if any found word has an index in range of 3 from the
            }
          });
        });
        const queryFound = findAdjacentSubtitles(foundSubs);
        console.log(queryFound);
        // entries.push({
        //   start: subtitle.start,
        //   dur: subtitle.dur,
        //   word: matchedWords.join(" "),
        //   phrase: query,
        // });

        // Return a VideoResult object only if entries exist for the video
        if (entries.length > 0) {
          return {
            id: video.id,
            image: video.thumbnailUrl,
            title: video.title,
            url: video.url,
            entries,
          };
        } else {
          return null; // Return null for videos without entries
        }
      })
      .filter((video) => video !== null) as VideoResult[]; // Filter out null entries

    // Return the processed videos with subtitles context
    return videosWithContext;
  } catch (error) {
    console.error("Failed to search videos by subtitle with context", error);
    throw new Error(
      "Error searching videos by subtitle with context in the database"
    );
  }
};
