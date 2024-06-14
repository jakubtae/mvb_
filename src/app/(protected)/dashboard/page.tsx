import { auth } from "@/auth";
import LibraryCard from "@/components/app_specific/LibraryCard";
import { Button } from "@/components/ui/button";
import { findrecentLibraries } from "@/data/library";
import Link from "next/link";
import NoLibrary from "@/components/app_specific/NoLibrary";

const DashboardPage = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    return console.log("No session id");
  }
  const recentLibraries = await findrecentLibraries(session?.user.id);
  // const recentLibraries = false;

  return (
    <>
      <h1 className="text-6xl font-bold">
        Hello {session?.user.name?.split(" ").shift()}
      </h1>

      {recentLibraries && (
        <div className="flex flex-col mt-4 p-5 bg-white shadow-md rounded-xl border-2 border-gray-300">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-2xl">Recently Used Libraries</h3>
            <div className="flex gap-x-1">
              <Button variant="link">
                <Link href="/library">Your Libraries</Link>
              </Button>
              <Button variant="link">
                <Link href="/library/create">New library</Link>
              </Button>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap mt-4">
            {recentLibraries.length > 0 ? (
              recentLibraries.map((library, index) => (
                <Link href={"/library/" + library.id} key={`${index}m`}>
                  <LibraryCard
                    libraryName={library.name}
                    videosNumber={library.videoIds.length}
                    status={library.status}
                    key={`${index}a`}
                  />
                </Link>
              ))
            ) : (
              <NoLibrary />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
