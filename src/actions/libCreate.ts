"use server";
import * as z from "zod";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary } from "@/data/library";
import { deleteALibrary } from "@/data/library";
import ytfps from "ytfps";
import { inngest } from "@/inngest/client";
import { revalidatePath, revalidateTag } from "next/cache";

export const newLibrary = async (
  values: z.infer<typeof LibrarySchema>,
  id: string
) => {
  const validatedFields = await LibrarySchema.safeParseAsync(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  if (!id) {
    return { error: "Must provide userId" };
  }
  const { name, sources } = validatedFields.data;
  const playlistRegex =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;

  // Extract the playlist ID
  const match = sources.match(playlistRegex);
  const playlistId = match ? match[1] : null;
  if (!playlistId) {
    throw new Error("Bad url");
  }

  let playlist;
  try {
    playlist = await ytfps(playlistId, { limit: 13 });
  } catch (error: any) {
    console.error("Error fetching playlist:", error.message);
    if (error.message === "This playlist is private or broken") {
      return { error: "The playlist is private or broken" };
    }
    return { error: "An error occurred while fetching the playlist" };
  }

  // Create the library initially
  let newLib;
  try {
    newLib = await createNewLibrary(name, sources, id, []);
    if (newLib.error) {
      return { error: newLib.error };
    }
  } catch (error) {
    console.error("Error creating initial library:", error);
    return { error: "An error occurred while creating the library" };
  }

  // Start processing videos in the background
  playlist.videos.forEach(async (playlistVideo) => {
    console.log(playlistVideo);
    await inngest.send({
      name: "video/process",
      data: {
        videoLink: playlistVideo,
        libraryId: newLib.id,
      },
    });
  });

  return { success: "Library created", id: newLib.id };
};

// Background video processing function

export const deleteLibrary = async (id: string) => {
  try {
    const delLib = await deleteALibrary(id);
    if (!delLib) {
      return { error: "Error deleting the library" };
    }
    revalidateTag("findUserLibraries");
    revalidatePath("/dashboard/libraries");
    return { success: "Library deleted" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
