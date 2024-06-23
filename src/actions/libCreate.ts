"use server";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary, deleteALibrary } from "@/data/library";
import ytfps from "ytfps";
import { inngest } from "@/inngest/client";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/prismadb";
import { YTvideo } from "node_modules/ytfps/lib/interfaces";
import { parseTimeToSeconds, formatSecondsToHHMMSS } from "@/lib/timeRelated";

interface ValueTypes {
  name: string;
  sources: { SourcesId: string; text: string }[];
  visibility: "PRIVATE" | "PUBLIC";
}

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
  let newLib;
  try {
    newLib = await createNewLibrary(
      name,
      sourceTexts,
      id,
      [],
      visibility as "PUBLIC" | "PRIVATE"
    );
    if (newLib.error) {
      return { error: newLib.error };
    }
  } catch (error) {
    console.error("Error creating initial library:", error);
    return { error: "An error occurred while creating the library" };
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
        status: "FINISHED",
        predictedDuration: preditedTime,
      },
    });
    // Send each unique video for processing
    await inngest.send({
      name: "video/process",
      data: {
        uniqueVideos: uniqueVideos,
        libraryId: newLib.id,
      },
    });
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
