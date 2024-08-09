import { getSubtitles } from "youtube-caption-extractor";
import { db } from "@/lib/prismadb";
import { YTvideo } from "node_modules/ytfps/lib/interfaces";
import { channelId, videoId } from "@gonetone/get-youtube-id-by-url";
type LocalSubtitle = {
  start: string;
  dur: string;
  text: string;
};

export const splitSubtitlesIntoWords = (
  subtitles: LocalSubtitle[]
): {
  text: string;
  start: string;
  dur: string;
  wordIndex: number;
}[] => {
  const words: {
    text: string;
    start: string;
    dur: string;
    wordIndex: number;
  }[] = [];
  if (subtitles.length === 0) {
    console.log("empty");
    return [];
  }
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
};

import { Innertube } from "youtubei.js";

export const fetchSubtitles = async (videoID: string, lang = "en") => {
  try {
    const youtube = await Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: false,
    });
    const info = await youtube.getInfo(videoID);

    try {
      const transcriptData = await info.getTranscript();
      if (
        transcriptData &&
        transcriptData.transcript.content &&
        transcriptData.transcript.content.body
      ) {
        const data =
          transcriptData.transcript.content.body.initial_segments.map(
            (segment) => {
              const start = segment.start_ms;
              const end = segment.end_ms;
              return {
                text: segment.snippet.text as string,
                start: start,
                dur: String(Number(end) - Number(start)),
              };
            }
          );
        return data;
      }
    } catch (err) {
      console.log(err);
      return [];
    }
    return [];
    // const subtitles = await getSubtitles({ videoID, lang });
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

export const processVideoInBackground = async (
  video: YTvideo,
  libraryId: string
): Promise<VideoProcessingResult> => {
  try {
    const existingVideo = await db.video.findFirst({
      where: { url: video.url },
    });
    let videoObject;
    if (!existingVideo) {
      const chanId = await channelId(video.author.url);
      const baseVideo = await db.video.create({
        data: {
          title: video.title,
          url: video.url,
          videoId: video.id,
          length: video.length,
          milisLength: video.milis_length,
          thumbnailUrl: video.thumbnail_url,

          // `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
          author: {
            channelId: chanId,
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
