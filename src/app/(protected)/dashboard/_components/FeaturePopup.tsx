// use client
"use client";
import { startTransition, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Features } from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { upVote } from "../_actions/upVote";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

interface FeaturePopupProps {
  data: Features;
}

const FeaturePopup = ({ data }: FeaturePopupProps) => {
  const { data: session, status } = useSession({ required: true });

  const [isPending, startTransition] = useTransition();

  if (!session?.user.id) {
    return null;
  }

  const handleUpvote = () => {
    startTransition(() => {
      upVote({ featureId: data.id, userId: session.user.id as string }).then(
        (data: { error?: string; success?: string }) => {
          if (data.error) {
            console.log(data.error);
            toast({
              variant: "destructive",
              title: "Error removing your upvote",
              description: data.error,
            });
          }
          if (data.success) {
            toast({
              title: data.success,
            });
          }
        }
      );
    });
  };

  return (
    <Dialog>
      <div className="flex flex-row w-full justify-between items-center py-2">
        <DialogTrigger asChild>
          <Button
            variant="link"
            className="dark:!text-white flex-grow justify-start px-0 text-wrap h-full"
          >
            {data.title} ({data.upvote})
          </Button>
        </DialogTrigger>
        <Button
          variant="buy"
          className="font-light"
          onClick={handleUpvote}
          disabled={isPending}
        >
          {data.whoUpvoted.includes(session.user.id) ? (
            <ChevronDown />
          ) : (
            <ChevronUp />
          )}
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogDescription>{data.publicDescription}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default FeaturePopup;
