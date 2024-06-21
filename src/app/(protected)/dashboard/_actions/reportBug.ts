"use server";
import { BugSchema } from "@/schemas";
import { db } from "@/lib/prismadb";
import { revalidateTag } from "next/cache";
import { ReportBagForm } from "../_components/foundABug";

export const createBug = async (values: ReportBagForm) => {
  try {
    const validatedFields = await BugSchema.safeParseAsync(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { content, createdBy } = validatedFields.data;
    const count = await db.bugs.count();

    const newFetaure = await db.bugs.create({
      data: {
        content,
        createdBy,
        serialNumber: count + 1,
      },
    });

    if (!newFetaure) {
      throw new Error("Failed to create feature");
    }
    revalidateTag("getBugs");

    return { success: "Feature created" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
