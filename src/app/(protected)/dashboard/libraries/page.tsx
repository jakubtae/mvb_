import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Library } from "@prisma/client";
import { db } from "@/lib/prismadb";
import { cache } from "@/lib/cache";
import LibraryContainer from "@/components/libraries/librariesDisplay";

const findUserLibraries = cache(
  async (userId: string): Promise<Library[]> => {
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
  },
  ["/", "dashboard", "libraries"],
  { revalidate: 60 * 60 * 24, tags: ["getUserLibarries"] }
);

const Libraries = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    console.log("No session ?");
    return redirect("/dashboard");
  }
  const Libraries = await findUserLibraries(session.user.id);
  return (
    <div className="w-full">
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg py-4 px-3 md:px-10 md:py-4 flex flex-col justify-start gap-2">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-semibold">Your Libraries</h2>
          <div className="flex gap-1">
            <Button asChild variant="ghost" className="px-2 md:px-4">
              <Link href="/dashboard/library/create">Create a library</Link>
            </Button>
          </div>
        </div>
        <div className="w-full py-2 flex items-center flex-col">
          {!Libraries || Libraries.length === 0 ? (
            <p className="font-sembiold text-neutral-500">
              You have no libraries.{" "}
            </p>
          ) : (
            <LibraryContainer libraries={Libraries} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Libraries;
