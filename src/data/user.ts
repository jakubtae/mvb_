import { db } from "@/lib/prismadb";
import { ObjectId } from "mongodb";

export const findUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    throw new Error("Error fetching user from database");
  }
};

export const findUserByID = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    throw new Error("Error fetching user from database");
  }
};
