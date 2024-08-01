// "use server";
// How the fuck do you get audio url with edge??
// ytdl-core?
// import ytdl from "ytdl-core";
// import { AssemblyAI } from "assemblyai";
// import { db } from "@/lib/prismadb";
// import fs from "fs";
// const client = new AssemblyAI({
//   apiKey: process.env.ASSEMBLY_KEY as string,
// });

// interface forceSubsParams {
//   who: string;
//   videoID: string;
// }
// const forceSubs = async (who: string, videoID: string) => {
//   try {
//     console.log("Started fetching");
//     // Check if user has credits
//     // Do the job
//     const video = await db.video.findFirst({
//       where: { videoId: videoID },
//       select: { url: true },
//     });
//     if (!video) {
//       throw new Error("No video with such ID");
//     }
//     const info = await ytdl.getInfo(video?.url);
//     // const audioUrl = ytdl.filterFormats(info.formats, "audioandvideo");
//     console.log(info.formats);
//     // const config = {
//     //   audio_url: audioUrl[0].url,
//     //   speaker_labels: true,
//     // };

//     // const transcript = await client.transcripts.transcribe(config);
//     // console.log(transcript);
//     // fs.writeFileSync("assemblyData.json", JSON.stringify(transcript));
//     // const updateVideo = await db.video.update({where: {videoId: videoID}, data: {}})
//   } catch (error: any) {
//     console.error(error);
//     return { error: error };
//   }
// };

// export default forceSubs;
