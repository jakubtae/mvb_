"use server";
import { db } from "@/lib/prismadb";
import { revalidateTag } from "next/cache";

interface UpVoteTypes {
  featureId: string;
  userId: string;
}

export const upVote = async ({ featureId, userId }: UpVoteTypes) => {
  try {
    const foundData = await db.features.findFirst({ where: { id: featureId } });

    if (!foundData) {
      return { error: "Didn't find such feature" };
    }

    if (foundData.whoUpvoted.includes(userId)) {
      const whoUpvotedUpdated = foundData.whoUpvoted.filter(
        (item) => item !== userId
      );
      // User already upvoted, remove upvote
      const removeUpVote = await db.features.update({
        where: { id: featureId },
        data: {
          upvote: foundData.upvote - 1,
          whoUpvoted: {
            set: whoUpvotedUpdated, // Remove userId from whoUpvoted array
          },
        },
      });
      if (removeUpVote) {
        revalidateTag("getNewestFeature");
        revalidateTag("getFeatures");

        return { success: "Removed your upvote" };
      } else {
        throw new Error("error removing your upvote");
      }
    } else {
      // User didn't upvote yet, add upvote
      const addUpVote = await db.features.update({
        where: { id: featureId },
        data: {
          upvote: foundData.upvote + 1,
          whoUpvoted: {
            push: userId, // Add userId to whoUpvoted array
          },
        },
      });
      if (addUpVote) {
        revalidateTag("getNewestFeature");
        revalidateTag("getFeatures");

        return { success: "Added your upvote" };
      } else {
        throw new Error("error increasing upvotes");
      }
    }
    // Return success or other appropriate response
  } catch (error) {
    console.error("Error upvoting feature:", error);
    return { error: `Unexpected error occurred ${error}` };
  }
};
