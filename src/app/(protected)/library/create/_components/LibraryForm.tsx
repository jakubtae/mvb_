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
import LibraryFormWrapper from "./LibraryFormWrapper";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    },
  });

  const onSubmit = (values: z.infer<typeof LibrarySchema>) => {
    console.log("Creating a new library");
    setError("");
    setSuccess("");
    const id = session?.user.id as string;
    startTransition(() => {
      newLibrary(values, id).then((data) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) {
          router.push("/library");
        }
      });
    });
  };

  return (
    <LibraryFormWrapper>
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
                    placeholder="Your YouTube public playlist link / channel link"
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
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full">
            Create a library
          </Button>
        </form>
      </Form>
    </LibraryFormWrapper>
  );
};

export default LibraryForm;
