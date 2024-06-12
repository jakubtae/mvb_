import { db } from "@/lib/prismadb";

export const checkVideoStatus = async (id: string) => {
  try {
    const video = await db.video.findFirst({
      where: {
        id: id,
      },
    });
    // TODO : implement status check - define percentage wise / certain step
    return { status: "finished" };
  } catch (error) {
    console.error("Failed to find video", error);
    throw new Error("Error fetching video from database");
  }
};
