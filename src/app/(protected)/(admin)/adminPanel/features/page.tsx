import FeatureLayout from "@/components/features/featureLayout";
import FeatureCreate from "./_components/featureCreate";

const AdminFeaturesPage = async () => {
  return (
    <div className="flex flex-col gap-2 w-full py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold">Features</h1>
        <FeatureCreate />
      </div>
      <FeatureLayout forWho="ADMIN" />
    </div>
  );
};

export default AdminFeaturesPage;
