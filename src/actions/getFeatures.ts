"use server";
import { Features } from "@prisma/client";
import { db } from "@/lib/prismadb";
import { cache } from "@/lib/cache";

export interface GroupedFeatures {
  ideaFeatures: Features[];
  inProgressFeatures: Features[];
  finishedFeatures: Features[];
}

export const findFeatures = async (): Promise<GroupedFeatures> => {
  try {
    const features = await db.features.findMany({
      orderBy: {
        upvote: "desc",
      },
    });
    if (!features) {
      throw new Error("Error finding user libraries");
    }

    const groupedFeatures: GroupedFeatures = {
      ideaFeatures: [],
      inProgressFeatures: [],
      finishedFeatures: [],
    };

    // Filter features into respective arrays based on stage
    features.forEach((feature) => {
      if (feature.stage === "IDEA") {
        groupedFeatures.ideaFeatures.push(feature);
      } else if (feature.stage === "IN_PRODUCTION") {
        groupedFeatures.inProgressFeatures.push(feature);
      } else if (feature.stage === "FINISHED") {
        groupedFeatures.finishedFeatures.push(feature);
      }
    });

    // Return an object containing arrays for each stage
    return groupedFeatures;
  } catch (error) {
    console.error("Failed to find user libraries", error);
    throw new Error("Error fetching libraries from database");
  }
};
