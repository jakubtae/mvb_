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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState, useTransition, useEffect } from "react";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { BugSchema, FeatureSchema } from "@/schemas";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Bug } from "lucide-react";
import Link from "next/link";
import { createBug } from "../_actions/reportBug";

export type ReportBagForm = z.infer<typeof BugSchema>;
function BugForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const { data: session, status } = useSession({ required: true });

  const form = useForm<ReportBagForm>({
    resolver: zodResolver(BugSchema),
    defaultValues: {
      content: "",
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

  const onSubmit: SubmitHandler<ReportBagForm> = (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      createBug(values).then((data: any) => {
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
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Description of the the bug"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-2 font-semibold"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}

const FoundABug = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex gap-2 justify-center items-center w-full"
        >
          <Bug size={20} />
          Found a bug?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a bug</DialogTitle>
          <DialogDescription>
            Here you can fill out a form that will let us know of all the bugs.{" "}
            <br />
            <Link
              href="/dashboard/features"
              className="hover:underline underline-offset-4"
            >
              If you want to propose a feature click here
            </Link>
          </DialogDescription>
        </DialogHeader>
        <BugForm />
      </DialogContent>
    </Dialog>
  );
};

export default FoundABug;
