"use server";
import { db } from "@/lib/prismadb";

export const getLibSources = async (id: string) => {
  try {
    const sources = await db.library.findFirst({
      where: { id: id },
      select: {
        name: true,
        visibility: true,
        sources: true,
        Videos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            title: true,
            author: true,
            status: true,
            videoId: true,
          },
        },
      },
    });
    return sources;
  } catch (error) {
    console.log(`Error fetching library sources : \n ${error}`);
  }
};
