"use server";

import { db } from "@/lib/prismadb";

export const deleteSource = async (id: string, libId: string) => {
  try {
    const deleteFrom = await db.library.findFirst({
      where: { id: libId },
    });

    if (!deleteFrom) {
      throw new Error("No such library");
    }

    // Filter out the id from videoIds array
    const updatedVideoIds = deleteFrom.videoIds.filter(
      (videoId: string) => videoId !== id
    );

    // Filter out the object with the id from videoStatus array
    const updatedVideoStatus = deleteFrom.videoStatus.filter(
      (status: { id: string }) => status.id !== id
    );

    await db.library.update({
      where: { id: libId },
      data: {
        videoIds: updatedVideoIds,
        videoStatus: updatedVideoStatus,
        videoNumber: {
          decrement: 1,
        },
      },
    });

    const libRemove = await db.video.findFirst({ where: { id: id } });

    const libRemoveLib = libRemove?.libraryIDs.filter(
      (libraryIDs: string) => libraryIDs !== libId
    );

    await db.video.update({
      where: { id: id },
      data: {
        libraryIDs: libRemoveLib,
      },
    });
    console.log("Deleted what needed to be done");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting a source: ", { error });
    return { error: "Error deleting a source" };
  }
};
