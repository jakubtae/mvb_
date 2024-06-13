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
const userRegex = /^https:\/\/www\.youtube\.com\/@[A-Za-z0-9_-]+$/;
const channelRegex = /^https:\/\/www\.youtube\.com\/channel\/[A-Za-z0-9_-]+$/;
const videoRegex =
  /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&t=\d+s)?$/;

// Custom validation function for YouTube URLs
const youtubeUrlValidation = z.string().refine(
  (url) => {
    return (
      playlistRegex.test(url) ||
      userRegex.test(url) ||
      channelRegex.test(url) ||
      videoRegex.test(url)
    );
  },
  {
    message: "Must be a valid YouTube playlist, user, channel, or video URL",
  }
);

// Video schema
export const VideoSchema = z.object({
  url: youtubeUrlValidation,
});

// Regular expression for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdValidation = z.string().refine((val) => objectIdRegex.test(val), {
  message: "Must be a valid ObjectId",
});

// Library schema
export const LibrarySchema = z.object({
  name: z.string().min(3, {
    message: "Must be at least 3 characters",
  }),
  // userId: objectIdValidation,
  sources: youtubeUrlValidation,
});
