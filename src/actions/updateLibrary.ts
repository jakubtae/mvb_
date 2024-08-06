"use server";
import { db } from "@/lib/prismadb";
import { LibrarySchema } from "@/schemas";
import ytfps from "ytfps";
import { YTvideo } from "node_modules/ytfps/lib/interfaces";
import { processVideoInBackground } from "./Library_create/functions";
import { VideoStatus } from "./libCreate";

interface ValueTypes {
  name: string;
  sources: { SourcesId: string; text: string }[];
  visibility: "PRIVATE" | "PUBLIC";
}

interface updateLib {
  libraryId: string;
  uniqueVideos: YTvideo[];
}
const concurrencyLimit = 10;
export const updateLibrary = async (
  values: ValueTypes,
  userId: string,
  libId: string
) => {
  try {
    const validatedFields = await LibrarySchema.safeParseAsync(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    if (!userId) {
      return { error: "Must provide userId" };
    }
    const { name, sources, visibility } = validatedFields.data;
    const newSources = sources.map((source) => {
      return source.text;
    });
    const checkLib = await db.library.findFirst({ where: { id: libId } });
    if (checkLib?.userId !== userId) {
      throw new Error(
        "Unauthorized access. You have to be an owner of this library to change it."
      );
    }
    const updatedVideoStatuses: VideoStatus[] = [];
    const errors: Array<{ videoUrl: string; error: string }> = [];

    if (checkLib.sources !== newSources) {
      // change sources into videos
      const playlistRegex =
        /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;
      // Start processing videos in the background
      try {
        // Retrieve playlists for each source
        const allVideos = await Promise.all(
          newSources.map(async (source) => {
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
                libId
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
          where: { id: libId },
          data: {
            videoIds: { push: updatedVideoStatuses.map((v) => v.id) },
            videoStatus: { push: updatedVideoStatuses }, // Push each updated video status
          },
        });
        return null;
      } catch (err: any) {
        throw new Error(err);
      }
    }
    const updateLib = await db.library.update({
      where: { id: libId },
      data: {
        name,
        sources: newSources,
        visibility,
        status: { set: "FINISHED" },
      },
    });
    if (!updateLib) {
      throw new Error("Error querying update");
    }

    return { success: "Library updated" };
  } catch (error: any) {
    console.error(`Error updating ${libId} library. \n ${error}`);
    return { error: error };
  }
};
