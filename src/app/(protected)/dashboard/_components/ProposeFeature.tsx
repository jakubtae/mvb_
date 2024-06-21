"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState, useTransition, useEffect } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { FeatureSchema } from "@/schemas";

import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createFeature } from "../../(admin)/adminPanel/features/_actions/createFeature";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export type ProposeFeatureForm = z.infer<typeof FeatureSchema>;

function CalendarForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const { data: session, status } = useSession({ required: true });

  const form = useForm<ProposeFeatureForm>({
    resolver: zodResolver(FeatureSchema),
    defaultValues: {
      title: "",
      publicDescription: "",
      developerNote: "",
      plannedFinish: undefined,
      stage: "IDEA",
      createdBy: "",
    },
  });

  useEffect(() => {
    if (session?.user.id) {
      form.setValue("createdBy", session.user.id);
    }
  }, [session, form]);

  // Early return based on session state
  if (!session?.user.id) {
    router.push("/dashboard");
    return null;
  }

  const onSubmit: SubmitHandler<ProposeFeatureForm> = (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      createFeature(values).then((data: any) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) {
          setTimeout(() => router.refresh(), 1000);
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Separator />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  disabled={isPending}
                  placeholder="Public Feature Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description of your feature"
                  className="resize-none"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          className="w-full font-semibold py-2"
          disabled={isPending}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}

const ProposeFeature = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-semibold text-xs sm:text-sm" variant="ghost">
          Propose a feature
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Propose a new feature.</DialogTitle>
          <DialogDescription>
            First please look{" "}
            <Link
              href="/dashboard/features"
              className="hover:underline underline-offset-4 hover:font-medium"
              target="_blank"
            >
              at those features.
            </Link>{" "}
            If your idea is not there fill out the below form to propose a new
            feature.
          </DialogDescription>
        </DialogHeader>
        <CalendarForm />
      </DialogContent>
    </Dialog>
  );
};

export default ProposeFeature;
