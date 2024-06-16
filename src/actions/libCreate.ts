"use server";
import * as z from "zod";
import { LibrarySchema } from "@/schemas";
import { createNewLibrary } from "@/data/library";
import { deleteALibrary } from "@/data/library";

export const newLibrary = async (
  values: z.infer<typeof LibrarySchema>,
  id: string
) => {
  const validatedFields = await LibrarySchema.safeParseAsync(values);
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

  return { success: "Library created", id: newLib.id };
};

export const deleteLibrary = async (id: string) => {
  try {
    const delLib = await deleteALibrary(id);
    if (!delLib) {
      return { error: "Error deleting the library" };
    }
    return { success: "Library deleted" };
  } catch (error) {
    return { error: error };
  }
};
