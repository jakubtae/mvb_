import { auth } from "@/auth";
import LibraryCard from "@/components/app_specific/LibraryCard";
import { Button } from "@/components/ui/button";
import { getAllLibraries } from "@/data/library";
import Link from "next/link";
import { redirect } from "next/navigation";
import NoLibrary from "@/components/app_specific/NoLibrary";

const LibraryPage = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    console.log("No user it on the /library path");
    return redirect("/dashboard");
  }
  const allLibraries = await getAllLibraries(session?.user.id);
  return (
    <>
      <div className="flex w-full justify-between items-center">
        <h1 className="text-6xl font-bold text-center">Your Libraries</h1>
        <Button size="lg">
          <Link href="/library/create">Create a new library</Link>
        </Button>
      </div>
      {allLibraries.length > 0 ? (
        <div className="mt-10 grid grid-cols-3 gap-10">
          {allLibraries.map((library, index) => (
            <Link href={"/library/" + library.id} key={index}>
              <LibraryCard
                libraryName={library.name}
                videosNumber={library.videoIds.length}
                status={library.status}
                key={index}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="w-full">
          <NoLibrary />
        </div>
      )}
    </>
  );
};

export default LibraryPage;
