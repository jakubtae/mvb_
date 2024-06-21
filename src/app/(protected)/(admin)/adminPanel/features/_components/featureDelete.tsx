"use client";
import { Button } from "@/components/ui/button";
import { deleteFeature } from "../_actions/deleteFeature";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
interface FeatureDeleteParams {
  id: string;
}

const FeatureDelete = ({ id }: FeatureDeleteParams) => {
  const { toast } = useToast();

  const buttonClick = async () => {
    try {
      const result = await deleteFeature(id);
      if (result.success) {
        toast({
          title: "Deleted successfully",
          description: result.success,
        });
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Error deleting a feature",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  return (
    <Button variant="outline" onClick={buttonClick}>
      Delete feature
    </Button>
  );
};

export default FeatureDelete;
