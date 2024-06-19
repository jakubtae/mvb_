"use server";
import * as z from "zod";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary } from "@/data/library";
import { deleteALibrary } from "@/data/library";
import ytfps from "ytfps";
import { getSubtitles } from "youtube-caption-extractor";
import { db } from "@/lib/prismadb";
import { Subtitle } from "@prisma/client";

type LocalSubtitle = {
  start: string;
  dur: string;
  text: string;
};

function splitSubtitlesIntoWords(subtitles: LocalSubtitle[]): {
  text: string;
  start: string;
  dur: string;
  wordIndex: number;
}[] {
  const words: {
    text: string;
    start: string;
    dur: string;
    wordIndex: number;
  }[] = [];
  let currentWordIndex = 0;

  subtitles.forEach((subtitle, subIndex) => {
    const startTime = parseFloat(subtitle.start);
    const duration = parseFloat(subtitle.dur);
    const subtitleText = subtitle.text;

    const wordArray = subtitleText.split(" ");
    const wordDuration = duration / wordArray.length;

    wordArray.forEach((word: string, index: number) => {
      words.push({
        text: word.toLowerCase(),
        start: String(startTime + index * wordDuration),
        dur: String(wordDuration),
        wordIndex: currentWordIndex,
      });
      currentWordIndex++;
    });
  });

  return words;
}

const fetchSubtitles = async (videoID: string, lang = "en") => {
  try {
    const subtitles = await getSubtitles({ videoID, lang });
    if (!Array.isArray(subtitles)) {
      console.log(subtitles);
    }
    return subtitles;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return null;
  }
};

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

  const videoIds: string[] = [];

  try {
    const videoPromises = playlist.videos.map(async (video) => {
      const existingVideo = await db.video.findFirst({
        where: { url: video.url },
      });

      if (!existingVideo) {
        const subtitles = await fetchSubtitles(video.id);
        if (!subtitles) {
          throw new Error("Error getting subtitles");
        }
        const splitSubtitles = splitSubtitlesIntoWords(subtitles);
        if (!splitSubtitles) {
          throw new Error("Error spliting subtitles");
        }
        const newVideo = await db.video.create({
          data: {
            title: video.title,
            url: video.url,
            videoId: video.id,
            length: video.length,
            milisLength: video.milis_length,
            thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
            author: {
              name: video.author.name,
              url: video.author.url,
            },
            subtitles: splitSubtitles, // Store the split subtitles here
          },
        });

        videoIds.push(newVideo.id);
      } else {
        videoIds.push(existingVideo.id);
      }
    });

    await Promise.all(videoPromises);
  } catch (error) {
    console.error("Error creating video entries:", error);
    return { error: "An error occurred while creating video entries" };
  }

  try {
    const newLib = await createNewLibrary(name, sources, id, videoIds);
    if (newLib.error) {
      return { error: newLib.error };
    }
    return { success: "Library created", id: newLib.id };
  } catch (error) {
    console.error("Error creating library:", error);
    return { error: "An error occurred while creating the library" };
  }
};

export const deleteLibrary = async (id: string) => {
  try {
    const delLib = await deleteALibrary(id);
    if (!delLib) {
      return { error: "Error deleting the library" };
    }
    return { success: "Library deleted" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
