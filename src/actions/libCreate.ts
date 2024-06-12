"use server";
import * as z from "zod";
import { LibrarySchema } from "@/schemas";

export const newLibrary = async (values: z.infer<typeof LibrarySchema>) => {
  const validatedFields = LibrarySchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  // TODO : implement login logic

  return { success: "Library created" };
};
