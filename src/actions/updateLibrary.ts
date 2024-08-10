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
import { Innertube, YTNodes } from "youtubei.js";
import { formatTime } from "@/lib/formatTime";

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
    const checkLib = await db.library.findFirst({
      where: { id: libId },
      include: { Videos: { select: { videoId: true } } },
    });
    if (checkLib?.userId !== userId) {
      throw new Error(
        "Unauthorized access. You have to be an owner of this library to change it."
      );
    }
    const updatedVideoStatuses: VideoStatus[] = [];
    const errors: Array<{ videoUrl: string; error: string }> = [];

    if (checkLib.sources !== newSources) {
      const youtube = await Innertube.create({
        lang: "en",
        location: "US",
        retrieve_player: false,
      });
      const playlistRegex =
        /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;

      try {
        const allVideos = await Promise.all(
          newSources.map(async (source) => {
            const match = source.match(playlistRegex);
            const playlistId = match ? match[1] : null;
            if (!playlistId) {
              throw new Error("Bad url");
            }
            console.log("Fetching yt playlsit");
            const generalPlaylist = youtube.getPlaylist(playlistId);
            const playlist = (await generalPlaylist).items;
            console.log("Fetched yt playlsit");
            return playlist;
          })
        );
        // Flatten the array of videos and remove duplicates based on playlistVideo.url
        const uniqueVideos2 = Array.from(
          new Map(allVideos.flat().map((video) => [video.id, video])).values()
        );

        console.log(uniqueVideos2.length);

        const uniqueVideos1 = uniqueVideos2.filter(
          (video) =>
            !checkLib.Videos.some((libVideo) => {
              return libVideo.videoId === video.id;
            })
        );

        console.log(uniqueVideos1.length);

        const uniqueVideos = uniqueVideos1.map((video) => {
          if (video instanceof YTNodes.PlaylistVideo) {
            return {
              title: String(video.title.text),
              url: "https://www.youtube.com/watch?v=" + video.id,
              id: video.id,
              length: formatTime(video.duration.seconds),
              milis_length: video.duration.seconds,
              thumbnail_url: video.thumbnails[0].url,
              author: {
                name: video.author.name,
                url: video.author.url,
              },
            };
          } else if (video instanceof YTNodes.ReelItem) {
            return {
              title: String(video.title.text),
              url: "https://www.youtube.com/watch?v=" + video.id,
              id: video.id,
              length: "00:00",
              milis_length: 0,
              thumbnail_url: video.thumbnails[0].url,
              author: {
                name: "unknown",
                url: "unknown",
              },
            };
          } else {
            // Optionally handle other cases or return a default value
            return {
              title: "unknown",
              url: "unknown",
              id: "unknown",
              length: "00:00",
              milis_length: 0,
              thumbnail_url: "unknown",
              author: {
                name: "unknown",
                url: "unknown",
              },
            };
          }
        });

        if (uniqueVideos.length <= 0) {
          return { success: "No videos to add" };
        }

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
