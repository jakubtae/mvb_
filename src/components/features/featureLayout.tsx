"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findFeatures } from "@/actions/getFeatures";
import { Features } from "@prisma/client";
import FeaturePopup from "@/app/(protected)/dashboard/_components/FeaturePopup";

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

const FeatureLayout: React.FC<FeatureLayoutProps> = ({ forWho }) => {
  const [groupedFeatures, setGroupedFeatures] = useState<{
    ideaFeatures: Features[];
    inProgressFeatures: Features[];
    finishedFeatures: Features[];
  } | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      const features = await findFeatures();
      setGroupedFeatures(features);
    };

    fetchFeatures();
  }, []);

  if (!groupedFeatures) {
    return <div>Loading...</div>;
  }

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

export default FeatureLayout;
