import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const findUserByEmail = async (email: string) => {
  try {
    const client = await clientPromise;
    const database = client.db();
    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ email });
    return user;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    throw new Error("Error fetching user from database");
  }
};

export const findUserByID = async (id: string) => {
  try {
    const client = await clientPromise;
    const database = client.db();
    const usersCollection = database.collection("users");

    const objectId = new ObjectId(id);
    const user = await usersCollection.findOne({ _id: objectId });
    return user;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    throw new Error("Error fetching user from database");
  }
};
