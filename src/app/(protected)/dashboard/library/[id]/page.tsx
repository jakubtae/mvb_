import { redirect } from "next/navigation";
import { findLibraryById } from "@/data/library";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteLibrary from "../../_components/DeleteLibrary";
import SearchLibraryTool from "./_components/SearchLibraryTool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/auth";
import { db } from "@/lib/prismadb";
import LibrarySettings from "./_components/LibrarySettings";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface LibraryIDPageProps {
  params: {
    id: string;
  };
}

const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

const LibraryIDPage = async ({ params }: LibraryIDPageProps) => {
  const session = await auth();
  if (!isValidObjectId(params.id) || !session || !session.user.id) {
    redirect("/dashboard/libraries");
  }

  const library = await findLibraryById(params.id);
  if (!library) {
    redirect("/dashboard/libraries");
  }
  if (library.visibility === "PRIVATE" && library.userId !== session.user.id) {
    return <>This library is private</>;
  }
  if (library.visibility === "PUBLIC") {
    if (!library.uniqueViews.includes(session.user.id)) {
      await db.library.update({
        where: { id: params.id },
        data: { uniqueViews: { push: session.user.id } },
      });
    }
  }
  const finishedVideosCount = library.videoStatus
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .filter((video) => video.status === "FINISHED").length;
  const noSubsVideoCount = library.videoStatus
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .filter((video) => video.status === "NO_SUBS").length;
  const inProcessVideoCount = library.videoStatus
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .filter((video) => video.status === "IN_PROCESS").length;
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
                {session.user.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{library.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full justify-between">
          <Button variant="link" asChild>
            <Link href={"/dashboard/library/" + library.id}>
              <h1 className="text-4xl font-bold lowercase">{library.name}</h1>
            </Link>
          </Button>
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
          <TabsContent value="search" className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Badge variant="outline">
                {inProcessVideoCount} / {library.videoNumber}
              </Badge>{" "}
              <Badge>
                {finishedVideosCount} / {library.videoNumber}
              </Badge>{" "}
              <Badge variant="destructive">
                {noSubsVideoCount} / {library.videoNumber}
              </Badge>
            </div>
            <Separator orientation="horizontal" />
            {library.status === "IN_PROCESS" && (
              <span className="text-wrap text-xs dark:text-neutral-300">
                If your library is big you might have to wait and refresh for a
                few minutes
              </span>
            )}{" "}
            <SearchLibraryTool libraryid={library.id} />
          </TabsContent>
          <TabsContent value="settings">
            <LibrarySettings id={library.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default LibraryIDPage;
