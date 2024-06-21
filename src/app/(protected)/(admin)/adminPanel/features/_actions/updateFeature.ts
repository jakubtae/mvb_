"use server";
import { FeatureSchema } from "@/schemas";
import { FeatureFormValues } from "../_components/featureCreate";
import { db } from "@/lib/prismadb";
import { revalidateTag } from "next/cache";

export const updateFeature = async (
  values: FeatureFormValues,
  featureId: string
) => {
  try {
    const validatedFields = await FeatureSchema.safeParseAsync(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const newFetaure = await db.features.update({
      where: { id: featureId },
      data: validatedFields.data,
    });

    if (!newFetaure) {
      throw new Error("Failed to update feature");
    }
    revalidateTag("getNewestFeature");
    revalidateTag("getFeatures");
    revalidateTag("dasboardgetFeatures");
    return { success: "Feature updated" };
  } catch (error: any) {
    console.error("Error deleting library:", error);
    return { error: error.message };
  }
};
