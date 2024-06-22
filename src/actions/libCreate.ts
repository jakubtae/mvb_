"use server";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary, deleteALibrary } from "@/data/library";
import ytfps from "ytfps";
import { inngest } from "@/inngest/client";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/prismadb";

interface ValueTypes {
  name: string;
  sources: { SourcesId: string; text: string }[];
  visibility: "PRIVATE" | "PUBLIC";
}

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

  // Start processing videos in the background
  try {
    const playlistRegex =
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;

    // Extract the playlist ID from the first source
    Promise.all(
      sourceTexts.map(async (source) => {
        const match = source.match(playlistRegex);
        const playlistId = match ? match[1] : null;
        if (!playlistId) {
          throw new Error("Bad url");
        }
        const playlist = await ytfps(playlistId, { limit: 13 });
        await Promise.all(
          playlist.videos.map(async (playlistVideo) => {
            await inngest.send({
              name: "video/process",
              data: {
                videoLink: playlistVideo,
                libraryId: newLib.id,
              },
            });
          })
        );
      })
    );
    // Send each video for processing
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

// Background video processing function

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
