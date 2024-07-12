"use server";
import { searchLibraryVideosBySubtitleWithContext } from "@/data/library";

export const searchLibrary = async (
  query: string,
  libraryId: string,
  take: number,
  skip: number,
  userId: string
) => {
  try {
    const result = await searchLibraryVideosBySubtitleWithContext(
      query,
      libraryId,
      take,
      skip,
      userId
    );
    return { success: result };
  } catch (error) {
    console.log(error);
    return { error: error as string };
  }
};
