import apiCreate from "@/lib/apiCreate";
import * as z from "zod";
import axios from "axios";
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
      // TODO : VALIDATE IF AN URL IS A PUBLIC OR PRIVATE PLAYLIST USING A FETCH TO BACKEND SERVER
      // const response = await axios.post(apiCreate(`/api/playlist`), data, {
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json;charset=UTF-8",
      //   },
      // });
      // if (response.status !== 200) {
      //   return false;
      // }
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
  name: z.string().min(3, {
    message: "Must be at least 3 characters",
  }),
  // userId: objectIdValidation,
  sources: youtubeUrlValidation,
});
