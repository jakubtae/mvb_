import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { findrecentLibraries } from "@/data/library";
import { cache } from "@/lib/cache";
import { db } from "@/lib/prismadb";
import Link from "next/link";
import FeaturePopup from "./_components/FeaturePopup";
import ProposeFeature from "./_components/ProposeFeature";
import { Separator } from "@/components/ui/separator";

const GetRecentFeature = cache(
  async () => {
    try {
      const feature = await db.features.findMany({
        where: {
          stage: "IN_PRODUCTION",
        },
        orderBy: [
          {
            upvote: "desc",
          },
        ],
        take: 3,
      });
      return feature;
    } catch (error) {
      console.error(`Error fetching the closest feature`);
      return { error: error };
    }
  },
  ["getNewestFeatures"],
  { revalidate: 60 * 60 * 24, tags: ["getNewestFeature"] }
);

const DashboardPage = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    return console.log("No session id");
  }
  const recentLibaries = await findrecentLibraries(session.user.id);
  const features = await GetRecentFeature();
  return (
    <div className="flex flex-col gap-10 md:gap-4 w-full py-2 md:py-4">
      <h1 className="text-6xl font-bold">
        Hello {session?.user.name?.split(" ").shift()}
      </h1>
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg py-4 px-3 md:px-10 md:py-4 flex flex-col justify-start gap-2">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-semibold">
            Recent Libraries
          </h2>
          <div className="flex gap-1">
            <Button asChild variant="ghost" className="px-2 md:px-4">
              <Link href="/dashboard/library/create">Create a library</Link>
            </Button>
            <Button asChild variant="ghost" className="px-2 md:px-4">
              <Link href="/dashboard/libraries">View all libraries</Link>
            </Button>
          </div>
        </div>
        <div className="w-full py-2 flex items-center flex-col">
          {!recentLibaries || recentLibaries.length === 0 ? (
            <p className="font-black">You have no recent libraries. </p>
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
      <div className="flex flex-col gap-2 py-4 px-3 md:px-10 md:py-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full md:max-w-[400px]">
        <div className="space-y-0">
          <h2 className="text-xl md:text-2xl font-semibold">
            Upcoming features
          </h2>
          <p className="text-sm md:text-base text-neutral-400">
            Press on a feature to learn more
          </p>
        </div>
        <div className="flex flex-col gap-1">
          {Array.isArray(features) &&
          features.length > 0 &&
          !("error" in features) ? (
            <>
              {features.map((feature, key) => (
                <FeaturePopup data={feature} key={key} />
              ))}
              <Button asChild className="font-semibold">
                <Link href="/dashboard/features">View all features</Link>
              </Button>
            </>
          ) : (
            <span className="text-center text-neutral-200">
              No upcoming features
            </span>
          )}
        </div>
        <Separator orientation="horizontal" />

        <ProposeFeature />
      </div>
    </div>
  );
};

export default DashboardPage;
