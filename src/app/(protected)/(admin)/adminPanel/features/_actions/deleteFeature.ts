"use server";
import { db } from "@/lib/prismadb";
import { revalidateTag } from "next/cache";

export const deleteFeature = async (featureID: string) => {
  try {
    const deleteFeature = await db.features.delete({
      where: { id: featureID },
    });

    if (!deleteFeature) {
      throw new Error("Failed to delete a feature");
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
