import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { Features } from "@prisma/client";
import { db } from "@/lib/prismadb";
import { cache } from "@/lib/cache";
import FeaturePopup from "../_components/FeaturePopup";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroupedFeatures {
  ideaFeatures: Features[];
  inProgressFeatures: Features[];
  finishedFeatures: Features[];
}

const findFeatures = cache(
  async (): Promise<GroupedFeatures> => {
    try {
      const features = await db.features.findMany({
        orderBy: {
          upvote: "desc",
        },
      });
      if (!features) {
        throw new Error("Error finding user libraries");
      }

      const groupedFeatures: GroupedFeatures = {
        ideaFeatures: [],
        inProgressFeatures: [],
        finishedFeatures: [],
      };

      // Filter features into respective arrays based on stage
      features.forEach((feature) => {
        if (feature.stage === "IDEA") {
          groupedFeatures.ideaFeatures.push(feature);
        } else if (feature.stage === "IN_PRODUCTION") {
          groupedFeatures.inProgressFeatures.push(feature);
        } else if (feature.stage === "FINISHED") {
          groupedFeatures.finishedFeatures.push(feature);
        }
      });

      // Return an object containing arrays for each stage
      return groupedFeatures;
    } catch (error) {
      console.error("Failed to find user libraries", error);
      throw new Error("Error fetching libraries from database");
    }
  },
  ["/", "dashboard", "dasboardgetFeatures"],
  { revalidate: 60 * 60 * 24, tags: ["dasboardgetFeatures"] }
);

interface FeatureGroupProps {
  handler: Features[];
}

const FeatureGroup = ({ handler }: FeatureGroupProps) => {
  return (
    <div className="space-y-4">
      {handler.length > 0 ? (
        <div className="flex flex-col gap-2">
          {handler.map((feature, key) => (
            <FeaturePopup data={feature} key={key} />
          ))}
        </div>
      ) : (
        <>No features</>
      )}
    </div>
  );
};

const Libraries = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    console.log("No session ?");
    return redirect("/dashboard");
  }
  const groupedFeatures = await findFeatures();
  return (
    <div className="w-full flex flex-col gap-2">
      <h1 className="text-2xl md:text-4xl font-bold">Features</h1>
      <Tabs defaultValue="ideas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="in_process">In process</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>
        <TabsContent value="ideas" className="mt-4 border-2 rounded-lg py-4">
          {groupedFeatures.ideaFeatures && (
            <FeatureGroup handler={groupedFeatures.ideaFeatures} />
          )}
        </TabsContent>
        <TabsContent
          value="in_process"
          className="mt-4 border-2 rounded-lg py-4"
        >
          {groupedFeatures.inProgressFeatures && (
            <FeatureGroup handler={groupedFeatures.inProgressFeatures} />
          )}
        </TabsContent>
        <TabsContent value="finished" className="mt-4 border-2 rounded-lg py-4">
          {groupedFeatures.finishedFeatures && (
            <FeatureGroup handler={groupedFeatures.finishedFeatures} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Libraries;
