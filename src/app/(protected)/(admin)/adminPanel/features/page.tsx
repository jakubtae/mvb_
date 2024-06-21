import FeatureCreate from "./_components/featureCreate";
import { FeatureLayout } from "@/app/(protected)/dashboard/features/page";

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
