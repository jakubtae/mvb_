import { inngest } from "./client";
import { getSubtitles } from "youtube-caption-extractor";
import { db } from "@/lib/prismadb";
import { Subtitle, Library } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
export const processVideo = inngest.createFunction(
  { id: "process-video" },
  { event: "video/process" },
  async ({ event, step }) => {
    const processStatus = await processVideoInBackground(
      event.data.videoLink,
      event.data.libraryId
    );
    if (processStatus.error) {
      return {
        event,
        statusCode: 506,
        body: JSON.stringify({ error: processStatus.error }),
      };
    }
    return {
      event,
      statusCode: 506,
      body: JSON.stringify({
        success: `Finished taking care of this video ${event.data.videoLink} for this library: ${event.data.libraryId}`,
      }),
    };
  }
);

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
    if (subtitles.length === 0) {
      console.log(`No subtitles for ${videoID}`);
    }
    return subtitles;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return null;
  }
};

const processVideoInBackground = async (video: any, libraryId: string) => {
  try {
    console.log(`Started processing for ${video.url}`);
    const existingVideo = await db.video.findFirst({
      where: { url: video.url },
    });
    let videoObject;
    if (!existingVideo) {
      const baseVideo = await db.video.create({
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
          status: "IN_PROCESS",
          libraryIDs: [libraryId],
        },
      });
      const subtitles = await fetchSubtitles(video.id);
      if (!subtitles) {
        throw new Error("Error getting subtitles");
      }
      const splitSubtitles = splitSubtitlesIntoWords(subtitles);
      if (!splitSubtitles) {
        throw new Error("Error splitting subtitles");
      }
      const newVideo = await db.video.update({
        where: {
          id: baseVideo.id,
        },
        data: {
          status: splitSubtitles.length > 0 ? "FINISHED" : "NO_SUBS",
          subtitles: splitSubtitles, // Store the split subtitles here
        },
      });

      videoObject = newVideo;
    } else {
      videoObject = existingVideo;
      await db.video.update({
        where: {
          id: videoObject.id,
        },
        data: {
          libraryIDs: { push: libraryId },
          status: "FINISHED",
        },
      });
    }
    await db.library.update({
      where: { id: libraryId },
      data: {
        videoIds: { push: videoObject.id },
        videoStatus: {
          push: { id: videoObject.id, status: videoObject.status },
        },
      },
    });
    // ! Doesn't work
    revalidateTag("findLibraryByID");
    return { success: "Success creating this video" };
  } catch (error) {
    console.error("Error creating video entries:", error);
    return { error: "Some error message" };
  }
};
