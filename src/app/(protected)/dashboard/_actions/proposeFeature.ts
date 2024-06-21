"use server";
import { FeatureSchema } from "@/schemas";
import { db } from "@/lib/prismadb";
import { revalidateTag } from "next/cache";
import { ProposeFeatureForm } from "../_components/ProposeFeature";

export const proposeFeature = async (values: ProposeFeatureForm) => {
  try {
    const validatedFields = await FeatureSchema.safeParseAsync(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { title, publicDescription, createdBy } = validatedFields.data;
    const newFetaure = await db.features.create({
      data: {
        title,
        publicDescription,
        createdBy,
      },
    });

    if (!newFetaure) {
      throw new Error("Failed to create feature");
    }
    revalidateTag("getNewestFeature");
    revalidateTag("getFeatures");
    revalidateTag("dasboardgetFeatures");
    return { success: "Feature created" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
