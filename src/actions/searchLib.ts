"use server";
import { searchLibraryVideosBySubtitleWithContext } from "@/data/library";

export const searchLibrary = async (query: string, libraryId: string) => {
  try {
    const result = await searchLibraryVideosBySubtitleWithContext(
      query,
      libraryId
    );
    return { success: result };
  } catch (error) {
    console.log(error);
    return { error: error as string };
  }
};
