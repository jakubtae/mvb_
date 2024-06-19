import { cache } from "@/lib/cache";
import { db } from "@/lib/prismadb";
import { Library } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

export const findUserLibraries = async (userId: string): Promise<Library[]> => {
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
}

export const searchLibraryVideosBySubtitleWithContext = async (
  query: string,
  libraryId: string
): Promise<VideoResult[]> => {
  try {
    // Split the query into individual words\
    console.log("GOT TO THE REQUEST");
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
    const videosWithContext: VideoResult[] = [];

    for (const video of videos) {
      const entrySet: Set<string> = new Set(); // Set to store unique entry keys
      const entries: VideoEntry[] = [];
      const foundSubs: Subtitle[] = [];

      // Process subtitles to find and add context around matched query words
      for (const subtitle of video.subtitles) {
        if (subtitle.text === queryWords[0]) {
          let foundPhrasearr: Subtitle[] = [];
          let isMatch = true;

          for (var z = 0; z < queryWords.length; z++) {
            const currentIndex = subtitle.wordIndex + z;
            if (
              currentIndex < video.subtitles.length &&
              video.subtitles[currentIndex].text === queryWords[z]
            ) {
              foundPhrasearr.push(video.subtitles[currentIndex]);
            } else {
              isMatch = false;
              break;
            }
          }

          if (isMatch) {
            // Calculate the phrase, start time, and total duration
            const phrase = foundPhrasearr.map((sub) => sub.text).join(" ");
            const start = foundPhrasearr[0].start;
            const totalDur = foundPhrasearr
              .reduce((acc, sub) => acc + parseFloat(sub.dur), 0)
              .toFixed(10);

            const result = {
              phrase: phrase,
              word: phrase,
              start: start,
              dur: totalDur,
            };

            entries.push(result);
            // console.log(result);
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
