import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProposeFeature from "../_components/ProposeFeature";
import FeatureLayout from "@/components/features/featureLayout";

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
