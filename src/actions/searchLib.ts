"use server";
import { searchLibraryVideosBySubtitleWithContext } from "@/data/library";

export const searchLibrary = async (
  query: string,
  libraryId: string,
  take: number,
  skip: number
) => {
  try {
    const result = await searchLibraryVideosBySubtitleWithContext(
      query,
      libraryId,
      take,
      skip
    );
    return { success: result };
  } catch (error) {
    console.log(error);
    return { error: error as string };
  }
};
