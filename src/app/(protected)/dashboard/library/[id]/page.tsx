import { redirect } from "next/navigation";
import { findLibraryById } from "@/data/library";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteLibrary from "../../_components/DeleteLibrary";
import SearchLibraryTool from "./_components/SearchLibraryTool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LibraryStatus from "./_components/LibraryStatus";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/auth";
import { db } from "@/lib/prismadb";
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
  return (
    <>
      <div className="flex flex-col gap-y-10 w-full">
        <div className="flex w-full justify-between">
          <Button variant="link" asChild>
            <Link href={"/dashboard/library/" + library.id}>
              <h1 className="text-4xl font-bold lowercase">{library.name}</h1>
            </Link>
          </Button>
          <div className="flex gap-6">
            <DeleteLibrary id={library.id} />
          </div>
        </div>
        <Tabs defaultValue="search" className="w-full">
          <TabsList>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="flex flex-col gap-4">
            <LibraryStatus videosIds={library.videoIds} />
            <Separator orientation="horizontal" />
            <SearchLibraryTool libraryid={library.id} />
          </TabsContent>
          <TabsContent value="sources">
            <h3>View your sources</h3>
            <p>Coming tommorow</p>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default LibraryIDPage;
