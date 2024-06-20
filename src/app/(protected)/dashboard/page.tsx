import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { findrecentLibraries } from "@/data/library";
import Link from "next/link";
const DashboardPage = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    return console.log("No session id");
  }
  const recentLibaries = await findrecentLibraries(session.user.id);
  return (
    <div className="flex flex-col gap-4 w-full py-2 md:py-4">
      <h1 className="text-6xl font-bold">
        Hello {session?.user.name?.split(" ").shift()}
      </h1>
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg py-2 px-2 md:px-10 md:py-4 flex flex-col justify-start gap-2">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-semibold">
            Recent Libraries
          </h2>
          <Button asChild variant="ghost">
            <Link href="/dashboard/library/create">Create a library</Link>
          </Button>
        </div>
        <div className="w-full py-2 flex items-center">
          {!recentLibaries || recentLibaries.length === 0 ? (
            <>
              You have no recent libraries.{" "}
              <Button variant="ghost" className="!text-base" asChild>
                <Link href="/dashboard/library/create">Start now</Link>
              </Button>
            </>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 w-full">
              {recentLibaries.map((library, key) => (
                <Link
                  key={key}
                  className="flex flex-col gap-2 px-6 py-2 md:px-4 flex-grow flex-shrink basis-0 md:max-w-[400px] bg-neutral-300 dark:bg-neutral-700 rounded hover:bg-neutral-400 hover:dark:bg-neutral-600"
                  href={"/dashboard/library/" + library.id}
                >
                  <div className="flex w-full justify-between">
                    <h4>{library.name}</h4>
                    {library.visibility.toLowerCase()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
