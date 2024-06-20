import { cache } from "@/lib/cache";
import { db } from "@/lib/prismadb";
import FeatureCreate from "./_components/featureCreate";

export const getFeatures = cache(
  async () => {
    const features = await db.features.findMany();
    return features;
  },
  ["/", "getFeatures"],
  { tags: ["/getFeatures"], revalidate: 60 * 60 * 12 }
);

const AdminFeaturesPage = async () => {
  const features = await getFeatures();
  return (
    <div className="flex flex-col gap-2 w-full py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold">Features</h1>
        <FeatureCreate />
      </div>
      {features.length > 0 ? (
        features.map((feature, key) => <div key={key}>{feature.title}</div>)
      ) : (
        <div className="flex flex-col md:flex-row gap-2 items-center">
          No features yet. <FeatureCreate />
        </div>
      )}
    </div>
  );
};

export default AdminFeaturesPage;
