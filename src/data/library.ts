import { db } from "@/lib/prismadb";

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
  context: string;
}

interface VideoResult {
  image: string;
  title: string;
  url: string;
  entries: VideoEntry[];
}

export const searchLibraryVideosBySubtitleWithContext = async (
  query: string,
  libraryId: string
): Promise<VideoResult[]> => {
  try {
    // Split the query into individual words
    const queryWords = query.toLowerCase().split(" ");

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
        // Initialize an array to store video entries (matched subtitles with context)
        const entries: VideoEntry[] = [];

        // Process subtitles to find and add context around matched query words
        video.subtitles.forEach((subtitle) => {
          // Convert subtitle text to lowercase for case-insensitive comparison
          const subtitleText = subtitle.text.toLowerCase();

          // Check if each word in queryWords is found in subtitle text
          const matchedWords = queryWords.filter((word) =>
            subtitleText.includes(word)
          );

          // If all query words are found in subtitle text
          if (matchedWords.length === queryWords.length) {
            // Extract context around the matched query words
            const startIndex = matchedWords.reduce((acc, word) => {
              return Math.max(acc, subtitleText.indexOf(word));
            }, 0);

            const beforeContext = subtitleText.substring(
              Math.max(0, startIndex - 20),
              startIndex
            );
            const afterContext = subtitleText.substring(
              startIndex + query.length,
              startIndex + query.length + 20
            );

            // Create a new VideoEntry object and push it to entries array
            entries.push({
              start: subtitle.start,
              dur: subtitle.dur,
              context: `${beforeContext} ${query} ${afterContext}`.trim(),
            });
          }
        });

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
