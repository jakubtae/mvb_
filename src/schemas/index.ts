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
  /^https:\/\/www\.youtube\.com\/playlist\?list=[A-Za-z0-9_-]+$/;
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
  name: z.string().toLowerCase().min(3, {
    message: "Must be at least 3 characters",
  }),
  // userId: objectIdValidation,
  sources: youtubeUrlValidation,
});
