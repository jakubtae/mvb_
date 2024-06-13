"use server";
import * as z from "zod";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary } from "@/data/library";

export const newLibrary = async (
  values: z.infer<typeof LibrarySchema>,
  id: string
) => {
  console.log("Library create action");
  const validatedFields = LibrarySchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  if (!id) {
    return { error: "Must provide userId" };
  }
  const { name, sources } = validatedFields.data;
  const newLib = await createNewLibrary(name, sources, id);
  if (newLib.error) {
    return { error: newLib.error };
  }

  return { success: "Library created" };
};
