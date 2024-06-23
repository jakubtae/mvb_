import { inngest } from "./client";
import { getSubtitles } from "youtube-caption-extractor";
import { db } from "@/lib/prismadb";
import { Subtitle, Library } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { YTvideo } from "node_modules/ytfps/lib/interfaces";

interface ProcessVideoResponse {
  event: Event;
  statusCode: number;
  body: string;
}

interface VideoStatus {
  id: string;
  status: "IN_PROCESS" | "NO_SUBS" | "FINISHED";
}
const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else {
    throw new Error(`Invalid time format: ${time}`);
  }
};

const formatSecondsToHHMMSS = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

export const processVideo = inngest.createFunction(
  { id: "process-video" },
  { event: "video/process" },
  async ({ event, step }) => {
    const startTime = Date.now(); // Start time tracking
    const uniqueVideos = event.data.uniqueVideos;
    const concurrencyLimit = 10; // Adjust concurrency level as needed

    console.log(`Started backprocess for ${event.data.libraryId}`);

    const errors: Array<{ videoUrl: string; error: string }> = [];
    const updatedVideoStatuses: VideoStatus[] = [];

    const processWithConcurrencyLimit = async (
      tasks: Array<() => Promise<void>>,
      limit: number
    ): Promise<void[]> => {
      const results: Promise<void>[] = [];
      const executing: Promise<void>[] = [];
      for (const task of tasks) {
        const p: Promise<void> = task().then((result: void) => {
          executing.splice(executing.indexOf(p), 1);
          return result;
        });
        results.push(p);
        executing.push(p);
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
      return Promise.all(results);
    };

    const tasks: Array<() => Promise<void>> = uniqueVideos.map(
      (video: YTvideo) => async () => {
        console.log(`Started processing ${video.url}`);
        try {
          const { id, status } = await processVideoInBackground(
            video,
            event.data.libraryId
          );
          if (id && status) {
            updatedVideoStatuses.push({ id, status });
          } else {
            errors.push({
              videoUrl: video.url,
              error: "Failed to process video",
            });
          }
        } catch (error) {
          errors.push({
            videoUrl: video.url,
            error: (error as Error).message || "Unknown error occurred",
          });
        }
      }
    );

    await processWithConcurrencyLimit(tasks, concurrencyLimit);

    console.log(`Finished processing ${event.data.libraryId} library`);

    // Update library with all processed video statuses
    await db.library.update({
      where: { id: event.data.libraryId },
      data: {
        videoIds: { push: updatedVideoStatuses.map((v) => v.id) },
        videoStatus: { push: updatedVideoStatuses }, // Push each updated video status
      },
    });

    // Calculate total video time in seconds and convert to HH:MM:SS
    const totalVideoTimeInSeconds = uniqueVideos.reduce(
      (sum: number, video: YTvideo) => sum + parseTimeToSeconds(video.length),
      0
    );
    const totalVideoTime = formatSecondsToHHMMSS(totalVideoTimeInSeconds);
    console.log(
      `Total video time for ${event.data.libraryId}: ${totalVideoTime}`
    );

    const endTime = Date.now(); // End time tracking
    const duration = (endTime - startTime) / 1000; // Duration in seconds
    console.log(
      `Processing time for ${event.data.libraryId}: ${duration} seconds`
    );

    if (errors.length > 0) {
      return {
        event,
        statusCode: 500,
        body: JSON.stringify({ errors, duration, totalVideoTime }),
      };
    }

    return {
      event,
      statusCode: 200,
      body: JSON.stringify({
        success: `Finished processing videos for library: ${event.data.libraryId}`,
        duration,
        totalVideoTime,
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

interface VideoProcessingResult {
  id?: string;
  status?: "IN_PROCESS" | "NO_SUBS" | "FINISHED";
  error?: string;
}

const processVideoInBackground = async (
  video: YTvideo,
  libraryId: string
): Promise<VideoProcessingResult> => {
  try {
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
      const updatedVideo = await db.video.update({
        where: {
          id: baseVideo.id,
        },
        data: {
          status: splitSubtitles.length > 0 ? "FINISHED" : "NO_SUBS",
          subtitles: splitSubtitles,
        },
      });

      videoObject = updatedVideo;
    } else {
      videoObject = existingVideo;
      await db.video.update({
        where: {
          id: videoObject.id,
        },
        data: {
          libraryIDs: { push: libraryId },
        },
      });
    }

    // Return videoObject.id and videoObject.status
    return {
      id: videoObject.id,
      status: videoObject.status,
    };
  } catch (error: any) {
    console.error("Error creating video entries:", error);
    return { error: error };
  }
};
