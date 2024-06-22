import * as z from "zod";
// Login schema
export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(8, {
    message: "Minimum 8 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

// Define the regular expressions for YouTube URLs
const playlistRegex =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:playlist\?list=|.*[?&]list=)([A-Za-z0-9_-]+)(?:&.*)?$/;

// const userRegex = /^https:\/\/www\.youtube\.com\/@[A-Za-z0-9_-]+$/;
// const channelRegex = /^https:\/\/www\.youtube\.com\/channel\/[A-Za-z0-9_-]+$/;
// const videoRegex = /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&t=\d+s)?$/;

const youtubeUrlValidation = z.string().refine(
  async (url: string) => {
    try {
      //* Validating if an url is a public playlist takes place in a :
      // src\data\library.ts CreateLibrary
      return playlistRegex.test(url);
    } catch (error) {
      return false;
    }
  },
  {
    message: "Must be a valid YouTube public playlist link",
  }
);

// Video schema
export const VideoSchema = z.object({
  url: youtubeUrlValidation,
});

// Library schema
export const LibrarySchema = z.object({
  name: z.string().min(3, { message: "Muse be at least 3 character" }),
  sources: z
    .array(z.object({ SourcesId: z.string(), text: youtubeUrlValidation }))
    .min(1, { message: "Must be at least one source" }),
  visibility: z.enum(["PRIVATE", "PUBLIC"]),
});

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().refine((val) => objectIdPattern.test(val), {
  message: "Invalid ObjectId",
});

export const FeatureSchema = z.object({
  title: z.string().min(10),
  publicDescription: z.string().min(20),
  developerNote: z.string(),
  plannedFinish: z.date().optional(),
  createdBy: objectIdSchema,
  stage: z
    .enum(["IDEA", "IN_PRODUCTION", "FINISHED"], {
      required_error: "Please select the feature stage",
    })
    .default("IDEA"),
});

export const BugSchema = z.object({
  content: z.string().min(20, {
    message: "Must be 20 characters",
  }),
  createdBy: objectIdSchema,
});
