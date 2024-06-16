import { db } from "@/lib/prismadb";

export const findUserLibraries = async (userId: string) => {
  try {
    const libraries = await db.library.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    if (!libraries) {
      throw new Error("Error finding user libraries");
    }
    return libraries;
  } catch (error) {
    console.error("Failed to find user libraries", error);
    throw new Error("Error fetching libraries from database");
  }
};

export const createNewLibrary = async (
  name: string,
  sources: string,
  id: string
) => {
  try {
    const libExists = await db.library.findFirst({
      where: {
        userId: id,
        name,
      },
    });
    if (libExists) {
      return {
        error: "Library with such a name already exists. Use a unique name.",
      };
    }

    // TODO CHECK IF URL IS A CORRECT PLAYLIST URL
    // if (!checkUrl.ok) {
    //   return { error: "Must be a public library" };
    // }
    const newLib = await db.library.create({
      data: {
        name,
        sources,
        userId: id,
      },
    });
    if (!newLib) {
      return { error: "Error creating a library" };
    }
    // TODO : PARSE A SOURCE
    return { success: "created a library", id: newLib.id };
  } catch (error) {
    console.error("Failed to find user libraries", error);
    throw new Error("Error fetching libraries from database");
  }
};

export const deleteALibrary = async (id: string) => {
  try {
    const gotDeleted = await db.library.delete({
      where: {
        id,
      },
    });
    gotDeleted.videoIds.forEach(async (videoId) => {
      const checkVid = await db.video.findUnique({
        where: {
          id: videoId,
        },
      });
      const toPull = await db.video.update({
        where: {
          id: videoId,
        },
        data: {
          libraryIDs: {
            set: checkVid?.libraryIDs.filter((id) => id !== gotDeleted.id),
          },
        },
      });
      if (!toPull) {
        throw new Error(
          "Error pulling relate library.id from Video.librariesIds"
        );
      }
    });
    return gotDeleted;
  } catch (error) {
    console.error("Failed to delete a library", error);
    throw new Error("Error deleting a library from database");
  }
};

export const updateLibraryStatus = async (id: string) => {
  try {
    const gotUpdated = await db.library.update({
      where: {
        id,
      },
      data: {
        status: "IN_PROCESS",
      },
    });
    if (!gotUpdated) {
      throw new Error("Prisma error / error updating");
    }
    return gotUpdated;
  } catch (error) {
    console.error("Failed to update a library status", error);
    throw new Error("Error updating a library status from database");
  }
};

export const findrecentLibraries = async (user_id: string) => {
  try {
    const libraries = await db.library.findMany({
      where: {
        userId: user_id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
    });
    return libraries;
  } catch (error) {
    console.error("Failed to find user libraries", error);
    throw new Error("Error fetching libraries from database");
  }
};

export const findLibraryById = async (id: string) => {
  try {
    const library = await db.library.findFirst({
      where: {
        id: id,
      },
      include: {
        Videos: true, // Include all fields of Video
      },
    });
    return library;
  } catch (error) {
    console.error("Failed to find a library by ID", error);
    throw new Error("Error fetching library by ID from database");
  }
};
