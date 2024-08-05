"use server";
import { db } from "@/lib/prismadb";
import { LibrarySchema } from "@/schemas";
import ytfps from "ytfps";
import { YTvideo } from "node_modules/ytfps/lib/interfaces";

interface ValueTypes {
  name: string;
  sources: { SourcesId: string; text: string }[];
  visibility: "PRIVATE" | "PUBLIC";
}

interface updateLib {
  libraryId: string;
  uniqueVideos: YTvideo[];
}

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
    if (checkLib.sources !== newSources) {
      // change sources into videos
      //   const playlistRegex =
      //   /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;
      // // Start processing videos in the background
      // try {
      //   // Retrieve playlists for each source
      //   const allVideos = await Promise.all(
      //     sourceTexts.map(async (source) => {
      //       const match = source.match(playlistRegex);
      //       const playlistId = match ? match[1] : null;
      //       if (!playlistId) {
      //         throw new Error("Bad url");
      //       }
      //       const playlist = await ytfps(playlistId);
      //       return playlist.videos;
      //     })
      //   );
      // Flatten the array of videos and remove duplicates based on playlistVideo.url
      // const uniqueVideos = Array.from(
      //   new Map(allVideos.flat().map((video) => [video.url, video])).values()
      // );
      // await Promise.all(
      //   videoIds.map((videoId) =>
      //     db.video.update({
      //       where: { id: videoId },
      //       data: {
      //         libraryIDs: {
      //           push: libId,
      //         },
      //       },
      //     })
      //   )
      // );
      // await db.library.update({
      //   where: { id: libId },
      //   data: {
      //     videoNumber: uniqueVideos.length,
      //     status: { set: "IN_PROCESS" },
      //     predictedDuration: preditedTime,
      //   },
      // });
      // createLib({ libraryId: libId as string, uniqueVideos: uniqueVideos });
    }
    const updateLib = await db.library.update({
      where: { id: libId },
      data: { name, sources: newSources, visibility },
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
