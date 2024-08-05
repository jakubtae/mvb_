"use server";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary, deleteALibrary } from "@/hooks/data/library";
import ytfps from "ytfps";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/prismadb";
import { YTvideo } from "node_modules/ytfps/lib/interfaces";
import { parseTimeToSeconds, formatSecondsToHHMMSS } from "@/lib/timeRelated";
import { processVideoInBackground } from "@/actions/Library_create/functions";

interface ValueTypes {
  name: string;
  sources: { SourcesId: string; text: string }[];
  visibility: "PRIVATE" | "PUBLIC";
}

export interface VideoStatus {
  id: string;
  status: "IN_PROCESS" | "NO_SUBS" | "FINISHED";
}

interface CreateLib {
  libraryId: string;
  uniqueVideos: YTvideo[];
}
const createLib = async ({ uniqueVideos, libraryId }: CreateLib) => {
  try {
    const startTime = Date.now(); // Start time tracking
    const concurrencyLimit = 10; // Adjust concurrency level as needed

    console.log(`Started backprocess for ${libraryId}`);

    const errors: Array<{ videoUrl: string; error: string }> = [];
    const updatedVideoStatuses: VideoStatus[] = [];

    const processWithConcurrencyLimit = async (
      tasks: Array<() => Promise<void>>,
      limit: number
    ): Promise<void[]> => {
      const results: Promise<void>[] = [];
      const executing: Promise<void>[] = [];
      for (const task of tasks) {
        const p: Promise<void> = task().then((result: void) => {
          executing.splice(executing.indexOf(p), 1);
          return result;
        });
        results.push(p);
        executing.push(p);
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
      return Promise.all(results);
    };

    const tasks: Array<() => Promise<void>> = uniqueVideos.map(
      (video: YTvideo) => async () => {
        // console.log(`Started processing ${video.url}`);
        try {
          const { id, status } = await processVideoInBackground(
            video,
            libraryId
          );
          if (id && status) {
            updatedVideoStatuses.push({ id, status });
          } else {
            errors.push({
              videoUrl: video.url,
              error: "Failed to process video",
            });
          }
        } catch (error) {
          errors.push({
            videoUrl: video.url,
            error: (error as Error).message || "Unknown error occurred",
          });
        }
      }
    );

    await processWithConcurrencyLimit(tasks, concurrencyLimit);

    // Update library with all processed video statuses
    await db.library.update({
      where: { id: libraryId },
      data: {
        videoIds: { push: updatedVideoStatuses.map((v) => v.id) },
        videoStatus: { push: updatedVideoStatuses }, // Push each updated video status
      },
    });

    // Calculate total video time in seconds and convert to HH:MM:SS
    const totalVideoTimeInSeconds = uniqueVideos.reduce(
      (sum: number, video: YTvideo) => sum + parseTimeToSeconds(video.length),
      0
    );
    const totalVideoTime = formatSecondsToHHMMSS(totalVideoTimeInSeconds);
    console.log(`Total video time for ${libraryId}: ${totalVideoTime}`);

    const endTime = Date.now(); // End time tracking
    const duration = (endTime - startTime) / 1000; // Duration in seconds
    console.log(`Processing time for ${libraryId}: ${duration} seconds`);

    console.log(
      `Processing speed : ${totalVideoTimeInSeconds / duration} in seconds`
    );

    if (errors.length > 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ errors, duration, totalVideoTime }),
      };
    }
    await db.library.update({
      where: { id: libraryId },
      data: { status: { set: "FINISHED" } },
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: `Finished processing videos for library: ${libraryId}`,
        duration,
        totalVideoTime,
      }),
    };
  } catch (error) {}
};

const avgTime = 5000; //in seconds, lowered because of unkown server metrics ( 7680 )

export const newLibrary = async (values: ValueTypes, id: string) => {
  const validatedFields = await LibrarySchema.safeParseAsync(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  if (!id) {
    return { error: "Must provide userId" };
  }

  const { name, sources, visibility } = validatedFields.data;

  // Extracting an array of source text strings
  const sourceTexts = sources.map((source) => source.text);

  // Create the library initially
  let newLib = await createNewLibrary(
    name,
    sourceTexts,
    id,
    [],
    visibility as "PUBLIC" | "PRIVATE"
  );
  if (!newLib) {
    throw new Error(`Error creating a library`);
  }

  const playlistRegex =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;
  // Start processing videos in the background
  try {
    // Retrieve playlists for each source
    const allVideos = await Promise.all(
      sourceTexts.map(async (source) => {
        const match = source.match(playlistRegex);
        const playlistId = match ? match[1] : null;
        if (!playlistId) {
          throw new Error("Bad url");
        }
        const playlist = await ytfps(playlistId);
        return playlist.videos;
      })
    );

    // Flatten the array of videos and remove duplicates based on playlistVideo.url
    const uniqueVideos = Array.from(
      new Map(allVideos.flat().map((video) => [video.url, video])).values()
    );

    // Calculate total video time in seconds and convert to HH:MM:SS
    const totalVideoTimeInSeconds = uniqueVideos.reduce(
      (sum: number, video: YTvideo) => sum + parseTimeToSeconds(video.length),
      0
    );

    const preditedTime = Math.floor(totalVideoTimeInSeconds / avgTime);

    await db.library.update({
      where: { id: newLib.id },
      data: {
        videoNumber: uniqueVideos.length,
        status: { set: "IN_PROCESS" },
        predictedDuration: preditedTime,
      },
    });
    createLib({ libraryId: newLib.id as string, uniqueVideos: uniqueVideos });
  } catch (error: any) {
    console.error("Error fetching or processing playlist:", error.message);
    return {
      error: "An error occurred while fetching or processing the playlist",
    };
  }

  // Revalidate cache tag
  revalidateTag("getUserLibarries");
  return { success: "Library created", id: newLib.id };
};

export const deleteLibrary = async (id: string) => {
  try {
    const delLib = await deleteALibrary(id);
    if (!delLib) {
      return { error: "Error deleting the library" };
    }
    // ! IS A WORKING CACHE
    revalidateTag("getUserLibarries");
    return { success: "Library deleted" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
