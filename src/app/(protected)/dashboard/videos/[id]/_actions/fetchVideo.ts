"use server";
import { db } from "@/lib/prismadb";
import type { Video } from "@prisma/client";

type FetchVideoReturnType = {
  success?: Video;
  error?: string;
};

const fetchVideo = async (id: string): Promise<FetchVideoReturnType> => {
  try {
    const videoData = await db.video.findFirst({ where: { videoId: id } });
    if (!videoData) {
      throw new Error(
        "We don't have this video yet. Try using it in your library."
      );
    }
    return { success: videoData };
  } catch (error: any) {
    return { error: error.message };
  }
};

export default fetchVideo;
