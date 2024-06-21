import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Bug } from "lucide-react";

const FoundABug = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <DialogTitle>
          <Button
            variant="ghost"
            className="flex gap-2 justify-center items-center"
          >
            <Bug size={20} />
            Found a bug?
          </Button>
        </DialogTitle>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Report a bug</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default FoundABug;
