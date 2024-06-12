"use server";
import * as z from "zod";
import bcrypt from "bcrypt";
import { RegisterSchema } from "@/schemas";
import clientPromise from "@/lib/db";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const client = await clientPromise;
    const database = client.db();
    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return { error: "Email already in use" };
    }

    await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
    });

    // TODO: Send verification token email

    return { success: "User created" };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { error: "Internal server error" };
  }
};
