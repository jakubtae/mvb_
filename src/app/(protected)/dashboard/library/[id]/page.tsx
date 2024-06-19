import { redirect } from "next/navigation";
import { findLibraryById } from "@/data/library";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteLibrary from "../../_components/DeleteLibrary";
import SearchLibraryTool from "./_components/SearchLibraryTool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  if (!isValidObjectId(params.id)) {
    redirect("/dashboard/libraries");
  }

  const library = await findLibraryById(params.id);
  if (!library) {
    redirect("/dashboard/libraries");
  }
  return (
    <>
      <div className="flex flex-col gap-y-10">
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
        {JSON.stringify(library.videoIds)}
        <Tabs defaultValue="search" className="">
          <TabsList>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <SearchLibraryTool libraryid={library.id} />
          </TabsContent>
          <TabsContent value="settings">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default LibraryIDPage;
