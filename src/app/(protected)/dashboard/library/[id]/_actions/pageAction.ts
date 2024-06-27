"use server";
import { db } from "@/lib/prismadb";

export type LibraryCheckResult = {
  status: "NOT_STARTED" | "IN_PROCESS" | "FINISHED";
  name: string;
  visibility: "PRIVATE" | "PUBLIC";
  userId: string;
  id: string;
  videoNumber: number;
};

export const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const getLibraryStatus = async (
  libraryId: string,
  puserId: string
): Promise<LibraryCheckResult | { error: string }> => {
  try {
    const library = await db.library.findFirst({
      where: { id: libraryId },
      select: {
        id: true,
        status: true,
        name: true,
        visibility: true,
        userId: true,
        uniqueViews: true,
        videoNumber: true,
      },
    });
    if (!library) {
      throw new Error("Didn't find such library.");
    }
    const { status, name, visibility, userId, id, videoNumber } = library;
    let number = Number(videoNumber);
    if (visibility === "PUBLIC" && !library.uniqueViews?.includes(puserId)) {
      await db.library.update({
        where: { id: libraryId },
        data: { uniqueViews: { push: puserId } },
      });
    }
    return {
      status,
      name,
      userId,
      visibility,
      id,
      videoNumber: number,
    };
  } catch (error: any) {
    return { error: `Error occurred: ${error}` };
  }
};
