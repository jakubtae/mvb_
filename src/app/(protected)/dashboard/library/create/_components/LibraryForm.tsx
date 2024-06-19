"use client";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LibrarySchema } from "@/schemas";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

import { newLibrary } from "@/actions/libCreate";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const LibraryForm = () => {
  const router = useRouter();

  const { data: session, status } = useSession({ required: true });
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LibrarySchema>>({
    resolver: zodResolver(LibrarySchema),
    defaultValues: {
      name: "",
      sources: "",
      visibility: "PRIVATE",
    },
  });

  const onSubmit = (values: z.infer<typeof LibrarySchema>) => {
    setError("");
    setSuccess("");
    const id = session?.user.id as string;
    startTransition(() => {
      newLibrary(values, id).then((data) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success && data.id) {
          router.push(`/dashboard/library/${data.id || ""}`, { scroll: true });
        }
      });
    });
  };

  return (
    <Card className="w-full max-w-[600px] shadow-none border-none py-10">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Library Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      disabled={isPending}
                      placeholder="Your library name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sources</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="text"
                      placeholder="Your YouTube public playlist link"
                    />
                  </FormControl>
                  <FormDescription>
                    We only accept one source right now. We are working on
                    expanding this.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If set to public then anyone can view it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full" disabled={isPending}>
              Create a library
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LibraryForm;
