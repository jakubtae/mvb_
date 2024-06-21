import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { Features } from "@prisma/client";

import FeaturePopup from "../_components/FeaturePopup";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProposeFeature from "../_components/ProposeFeature";
import { findFeatures } from "@/actions/getFeatures";

interface FeatureGroupProps {
  handler: Features[];
  forWho: "USER" | "ADMIN";
}

const FeatureGroup = ({ handler, forWho }: FeatureGroupProps) => {
  return (
    <div className="space-y-4">
      {handler.length > 0 ? (
        <div className="flex flex-col gap-2">
          {handler.map((feature, key) => (
            <FeaturePopup data={feature} key={key} forWho={forWho} />
          ))}
        </div>
      ) : (
        <div className="flex p-2">No features</div>
      )}
    </div>
  );
};

interface FeatureLayoutProps {
  forWho: "ADMIN" | "USER";
}
export const FeatureLayout = async ({ forWho }: FeatureLayoutProps) => {
  const groupedFeatures = await findFeatures();
  return (
    <div className="w-full flex flex-col gap-2">
      <Tabs defaultValue="ideas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="in_process">In process</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>
        <TabsContent value="ideas" className="mt-4 border-2 rounded-lg py-4">
          {groupedFeatures.ideaFeatures && (
            <FeatureGroup
              handler={groupedFeatures.ideaFeatures}
              forWho={forWho}
            />
          )}
        </TabsContent>
        <TabsContent
          value="in_process"
          className="mt-4 border-2 rounded-lg py-4"
        >
          {groupedFeatures.inProgressFeatures && (
            <FeatureGroup
              handler={groupedFeatures.inProgressFeatures}
              forWho={forWho}
            />
          )}
        </TabsContent>
        <TabsContent value="finished" className="mt-4 border-2 rounded-lg py-4">
          {groupedFeatures.finishedFeatures && (
            <FeatureGroup
              handler={groupedFeatures.finishedFeatures}
              forWho={forWho}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FeaturesPage = async () => {
  const session = await auth();
  if (!session || !session.user.id) {
    console.log("No session ?");
    return redirect("/dashboard");
  }
  return (
    <div className="flex flex-col gap-2 w-full py-4">
      <div className="w-full flex justify-between">
        <h1 className="text-2xl md:text-4xl font-bold">Features</h1>
        <ProposeFeature />
      </div>
      <FeatureLayout forWho="USER" />
    </div>
  );
};

export default FeaturesPage;
