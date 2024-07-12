"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import {
  getLibraryStatus,
  isValidObjectId,
  LibraryCheckResult,
} from "./_actions/pageAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchLibraryTool from "./_components/SearchLibraryTool";
import LibrarySettings from "./_components/LibrarySettings";
import Link from "next/link";

interface LibraryIDPageProps {
  params: {
    id: string;
  };
}

const LibraryIDPage = ({ params }: LibraryIDPageProps) => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/login");
    },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const libraryRef = useRef<LibraryCheckResult | { error: string } | null>(
    null
  ); // Ref to hold the library state
  const intervalId = useRef<NodeJS.Timeout | null>(null); // Ref to hold the interval ID

  useEffect(() => {
    if (!isValidObjectId(params.id)) {
      router.push("/dashboard/libraries");
      return;
    }

    const fetchLibraryStatus = async () => {
      console.log("Fetching");
      try {
        const data = await getLibraryStatus(
          params.id,
          session?.user.id as string
        );
        libraryRef.current = data; // Update libraryRef with fetched data
        if ("status" in data && data.status === "FINISHED") {
          setLoading(false);
          clearInterval(intervalId.current!); // Clear interval when finished
        }
        if ("error" in data) {
          setLoading(false);
          clearInterval(intervalId.current!); // Clear interval when finished
          console.log(data.error);
        }
      } catch (error: any) {
        libraryRef.current = { error: error.message }; // Store error in libraryRef
        setLoading(false);
        clearInterval(intervalId.current!); // Clear interval on error
      }
    };

    // Fetch data only if libraryRef.current is not null and libraryRef.current.status is not "FINISHED"
    if (
      (libraryRef.current && "error" in libraryRef.current) ||
      (libraryRef.current &&
        "status" in libraryRef.current &&
        libraryRef.current.status !== "FINISHED")
    ) {
      fetchLibraryStatus();
    }

    // Clear interval if it exists when params.id, router, or session change
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }

    // Set interval to fetch every 5 seconds
    intervalId.current = setInterval(fetchLibraryStatus, 3000);

    return () => {
      // Clean up on unmount: clear interval
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [params.id, router, session]);

  // Access library from useRef
  const library = libraryRef.current;
  if (loading || !library) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center">
        <span className="font-semibold text-center">
          This library is being prepared. If you just created it you will have
          to wait between few seconds to few minutes.
        </span>
        <LoaderCircle className="animate-spin" color="#8B5FBF" />
      </div>
    );
  }

  if ("error" in library) {
    return (
      <>
        <div className="flex flex-col gap-y-4 w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/libraries">
                  Libraries
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/libraries">
                  {session?.user?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex w-full justify-between">
            <h1 className="text-4xl font-bold lowercase">{library.error}</h1>
            <Link href="/dashboard/libraries">Go back</Link>
            <Link href="/dashboard">Report the issue</Link>
          </div>
        </div>
      </>
    );
  }

  if (
    library.visibility === "PRIVATE" &&
    library.userId !== session?.user?.id
  ) {
    return (
      <>
        <div className="flex flex-col gap-y-4 w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/libraries">
                  Libraries
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/libraries">
                  {session?.user?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex w-full justify-between">
            <h1 className="text-4xl font-bold lowercase">
              This library is private
            </h1>
            <Link href="/dashboard/libraries">Go back</Link>
          </div>
        </div>
      </>
    );
  }

  // Destructure library safely assuming it's not null and doesn't have an error
  const { name, id, videoNumber } = library;

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/libraries">
              Libraries
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/libraries">
              {session?.user?.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full justify-between">
        <h1 className="text-4xl font-bold lowercase">{name}</h1>
      </div>
      <Tabs defaultValue="search" className="w-full mt-4">
        <TabsList className="w-full flex justify-between !py-6 mb-4">
          <div className="flex gap-2">
            <TabsTrigger value="search" className="py-2">
              Search
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-2">
              Settings
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="search">
          {session && session.user.id && (
            <SearchLibraryTool
              libraryid={id}
              docsLimit={videoNumber}
              userId={session.user.id}
            />
          )}
        </TabsContent>
        <TabsContent value="settings">
          <LibrarySettings libId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibraryIDPage;
