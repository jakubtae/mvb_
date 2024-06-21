"use server";
import { FeatureSchema } from "@/schemas";
import { FeatureFormValues } from "../_components/featureCreate";
import { db } from "@/lib/prismadb";
import { revalidateTag } from "next/cache";

export const createFeature = async (values: FeatureFormValues) => {
  try {
    const validatedFields = await FeatureSchema.safeParseAsync(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const newFetaure = await db.features.create({
      data: validatedFields.data,
    });

    if (!newFetaure) {
      throw new Error("Failed to create feature");
    }
    revalidateTag("getNewestFeature");
    revalidateTag("getFeatures");

    return { success: "Feature created" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
