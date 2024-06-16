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
  url: string;
  entries: VideoEntry[];
}

export const searchLibraryVideosBySubtitleWithContext = async (
  libraryId: string,
  query: string
): Promise<VideoResult[]> => {
  try {
    const videos = await db.video.findMany({
      where: {
        libraryIDs: {
          has: libraryId,
        },
        subtitles: {
          some: {
            text: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
    });

    const videosWithContext: VideoResult[] = videos.map((video) => {
      const entries: VideoEntry[] = [];

      video.subtitles.forEach((subtitle) => {
        const subtitleText = subtitle.text.toLowerCase();
        const queryLower = query.toLowerCase();
        const index = subtitleText.indexOf(queryLower);

        if (index !== -1) {
          const beforeContext = subtitleText.substring(
            Math.max(0, index - 20),
            index
          );
          const match = subtitleText.substring(
            index,
            index + queryLower.length
          );
          const afterContext = subtitleText.substring(
            index + queryLower.length,
            index + queryLower.length + 20
          );

          entries.push({
            start: subtitle.start,
            dur: subtitle.dur,
            context: `${beforeContext} ${match} ${afterContext}`,
          });
        }
      });

      return {
        url: video.url,
        entries: entries,
      };
    });

    return videosWithContext;
  } catch (error) {
    console.error("Failed to search videos by subtitle with context", error);
    throw new Error(
      "Error searching videos by subtitle with context in the database"
    );
  }
};
